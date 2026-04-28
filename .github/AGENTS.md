---
name: Repository agent instructions
description: |
  Use the repo layout, NestJS/TypeScript conventions, and available npm scripts to answer coding and SCM questions. Link to README for Swagger/Vercel deployment notes, and do not assume GitHub workflow files exist.
labels:
  - backend
  - nestjs
  - typescript
  - typeorm
  - scm
---

## Project Overview

- Backend API built with NestJS v11 and TypeScript.
- Uses TypeORM for database access and migrations.
- Exposes multiple feature modules under `src/modules/`.
- Includes authentication in `src/auth/`, database setup in `src/db/`, audit logging in `src/audit-log/`, and shared decorators/validation in `src/common/`.
- Swagger UI is served from `public/swagger.html`; the README only documents docs hosting and Vercel behavior.

## Key Files and Directories

- `package.json` — main scripts and dependencies.
- `src/app.module.ts` — application module bootstraps feature modules.
- `src/modules/**` — domain features (associates, dues, organizations, payments, users).
- `src/db/entities/` — TypeORM entities.
- `src/db/migrations/` — migration history and TypeORM config in `src/db/typeOrm.migration-config.ts`.
- `src/auth/` — authentication controller, service, guard, DTOs.
- `public/swagger.html` — static Swagger UI configuration for docs.
- `api/index.ts` — Vercel serverless handler.

## Useful npm Scripts

- `npm install`
- `npm run build`
- `npm run start:dev`
- `npm run lint`
- `npm run format`
- `npm run test`
- `npm run test:e2e`
- `npm run migration:create -- --name <name>`
- `npm run migration:run`
- `npm run migration:revert`

## Coding Guidance

- Follow existing NestJS patterns: module imports, controllers, services, DTOs, guards, and providers.
- Keep feature work inside `src/modules/**` and shared behavior in `src/common/`.
- Preserve TypeORM entity/migration consistency when changing data models.
- Avoid editing generated files and `node_modules/`.

## SCM-Specific Notes

- There is no preexisting `.github/` workflow or CI config in this repo, and no GitHub-specific agent customization was present before this file.
- Default branch is `main`.
- Do not invent project-specific GitHub policies, branch naming rules, or release processes unless the user supplies them.
- For schema or migration changes, ensure `src/db/migrations/` stays aligned with `src/db/typeOrm.migration-config.ts`.
- Prefer small, well-scoped commits that match the current backend architecture.

## When Asked About This Repo

- Use `package.json` scripts for build, lint, format, and tests.
- Reference the existing `README.md` only for Swagger/Vercel docs details.
- Answer questions using the repo's NestJS module structure and TypeORM conventions.
