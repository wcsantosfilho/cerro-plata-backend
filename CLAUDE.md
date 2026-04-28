# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # watch mode
npm run build           # compile to dist/

# Linting & formatting
npm run lint            # ESLint with auto-fix
npm run format          # Prettier

# Tests
npm run test            # unit tests (Jest, rootDir: src/)
npm run test:watch      # watch mode
npm run test:cov        # coverage
npm run test:e2e        # e2e (test/jest-e2e.json)

# Run a single test file
npx jest src/modules/users/user.service.spec.ts
npx jest src/integration/integration.spec.ts

# Database migrations
npm run migration:create -- --name <migration-name>
npm run migration:run
npm run migration:revert
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
JWT_SECRET, JWT_EXPIRATION_TIME, REFRESH_TOKEN_EXPIRATION_TIME
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
NODE_ENV, FRONTEND_ORIGIN
```

## Architecture

### Multi-tenancy

Every request carries a JWT whose payload includes `tenant` (= `organizationId`). The `TenantGuard` (`src/common/tenant/tenant.guard.ts`) validates its presence; the `@CurrentTenant()` decorator (`src/common/decorators/current-tenant.decorator.ts`) extracts it in controllers. All service queries are scoped to the tenant's `organizationId` — never return data across organizations.

### Module layout

```
src/
  app.module.ts             # root module
  main.ts                   # bootstrap + Swagger + cookie-parser
  auth/                     # JWT sign-in, refresh, revoke (HttpOnly cookie)
  audit-log/                # AuditInterceptor logs CREATE/UPDATE/DELETE per request
  common/
    decorators/             # @CurrentTenant, @ApiError, @ApiPagination, @ToPhone
    tenant/                 # TenantGuard, TenantContextService
    validatecpf.ts          # Brazilian CPF validation
  db/
    db.module.ts            # TypeORM Postgres config (env-driven, synchronize: false)
    entities/               # TypeORM entities
    migrations/             # migration history
    typeOrm.migration-config.ts  # DataSource used by CLI
  modules/
    organizations/          # tenant/organization CRUD
    users/                  # app users (bcrypt passwords, scoped to org)
    associates/             # members with CPF uniqueness, associationRecord auto-increment
    dues/                   # billing obligations (MEMBERSHIP_FEE requires associateId)
    payments/               # payment records; MEMBERSHIP_FEE requires dueId + associateId
```

### Auth flow

`POST /auth/sign-in` → returns short-lived JWT (default 15 min) + opaque refresh token (`<uuid>.<hex>`). Refresh tokens are stored hashed in the `refresh_tokens` table and rotated on use. Revocation via `POST /auth/sign-out`.

### Integration tests (SQLite)

`src/integration/integration.spec.ts` runs services against an in-memory SQLite database using `better-sqlite3`. Because production entities use `timestamp`/`timestamptz` (Postgres types), the test file patches `EntityMetadataValidator` before module compilation and creates the schema with raw DDL using SQLite-native types. Do not replace this approach with `synchronize: true`.

### Business rules enforced in services

- **Associates**: CPF must be valid and unique per organization; `associationRecord` must be unique per organization; if omitted, it auto-increments from the last record.
- **Dues**: `MEMBERSHIP_FEE` type requires an `associateId`.
- **Payments**: `MEMBERSHIP_FEE` type requires both `associateId` and `dueId`; a due cannot be paid twice.

### Migrations

Migrations live in `src/db/migrations/` and are run via TypeORM CLI using `src/db/typeOrm.migration-config.ts` as the DataSource. `synchronize` is always `false` in all environments.

## Git Workflow

Before making any code changes, always ask the user:
- Work directly on `main`, or
- Create a new branch (and if so, what name)?

Never use git worktrees. Work exclusively with branches.
