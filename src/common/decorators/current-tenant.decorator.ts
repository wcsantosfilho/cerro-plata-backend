// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface userRequest {
  user?: {
    tenant?: string;
  };
}

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & userRequest>();
    const tenantId: string | undefined = req.user?.tenant
      ? req.user.tenant
      : 'No tenant found';
    return tenantId;
  },
);
