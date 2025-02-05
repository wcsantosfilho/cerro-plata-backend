import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const libsql = createClient({
            url: `${process.env.TURSO_DATABASE_URL}`,
            authToken: `${process.env.TURSO_AUTH_TOKEN}`,
        });

    const adapter = new PrismaLibSQL(libsql);

    super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
}
