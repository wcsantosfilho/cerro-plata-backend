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

    console.dir(request);
    console.log(`AuditInterceptor: ${method} ${url}`);

    return next.handle().pipe(
      tap(async (responseBody) => {
        const action = this.getAction(method);
        if (!action) return;
        const logBody = {
          userId: user?.sub ?? 'anonymous',
          action,
          entity: this.extractPartsFromUrl(url, 'entity') || 'unknown',
          entityId:
            this.extractPartsFromUrl(url, 'entityId') ||
            responseBody?.id?.toString(),
          dataAfter: responseBody,
          ipAddress: ip,
        };
        await this.auditService.logAction({
          ...logBody,
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

  private extractPartsFromUrl(url: string, part: string): any {
    // Ex: /api/payments → payments
    // const regexp = new RegExp(/((\/.+\/)(.+)\/(.*)/); // Ex: /api/payments/123 → payments | /api/payments → payments
    const regexp = new RegExp(/^\/api(?:\/([^/]+))(?:\/([^/]+))?$/); // Ex: /api/payments/123 → payments | /api/payments → payments
    const match = regexp.exec(url) || [];
    if (match.length >= 1) {
      switch (part) {
        case 'entity':
          return match[1];
        case 'entityId':
          return match[2];
        default:
          return match[1];
      }
    } else {
      return null;
    }
  }
}
