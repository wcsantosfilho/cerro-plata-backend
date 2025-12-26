/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: any }>();
    const user = request?.user; // assume que o AuthGuard adiciona o user
    const ip = request?.ip;
    const method = request?.method;
    const url = request?.url;

    return next.handle().pipe(
      tap(async (responseBody) => {
        const action = this.getAction(method);
        if (!action) return;

        await this.auditService.logAction({
          userId: user?.id ?? 'anonymous',
          action,
          entity: this.extractEntityFromUrl(url),
          entityId: responseBody?.id?.toString(),
          dataAfter: responseBody,
          ipAddress: ip,
        });
      }),
    );
  }

  private getAction(method: string) {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return null;
    }
  }

  private extractEntityFromUrl(url: string): string {
    // Ex: /api/payments → payments
    return url.split('/').filter(Boolean).pop() || 'unknown';
  }
}
