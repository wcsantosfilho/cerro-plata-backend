// src/common/tenant/tenant.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

interface RequestWithUser {
  user?: {
    tenant?: string;
  };
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.tenant) {
      throw new UnauthorizedException('Tenant ID not found in token');
    }

    return true;
  }
}
