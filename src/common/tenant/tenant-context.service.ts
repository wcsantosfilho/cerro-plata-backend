// src/common/tenant/tenant-context.service.ts
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getTenantId(): string {
    // console.log(`Request: ${this.request.method} ${this.request.url} `);
    // return this.request?.user?.tenant;
    // const a = JSON.stringify(this.request?.user);
    // console.log(`User from request: ${a}`);
    return '0668342c-0e50-4dee-a022-899e5fb0b1f1'; // Mocked tenant ID for testing
  }
}
