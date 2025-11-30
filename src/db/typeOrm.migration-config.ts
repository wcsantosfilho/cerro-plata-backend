import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from './entities/users.entity';
import { AssociateEntity } from './entities/associate.entity';
import { PaymentEntity } from './entities/payment.entity';

config();

const configService = new ConfigService();

console.log(`Running migration on env ${process.env.NODE_ENV}`);

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [UserEntity, AssociateEntity, PaymentEntity],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};

export default new DataSource(dataSourceOptions);
