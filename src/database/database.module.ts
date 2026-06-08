import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cart/entities/cart-items.entity';
import { Order } from 'src/order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const host = process.env.RDS_PG_HOST;
        const username = process.env.RDS_PG_USERNAME;
        const password = process.env.RDS_PG_PASSWORD;
        const database = process.env.RDS_PG_DATABASE;

        if (!host || !username || !password || !database) {
          throw new Error('Missing required database environment variables: RDS_PG_HOST, RDS_PG_USERNAME, RDS_PG_PASSWORD, RDS_PG_DATABASE');
        }

        const parsedPort = Number.parseInt(process.env.RDS_PG_PORT ?? '', 10);
        const isProduction = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
        const synchronize = (process.env.TYPEORM_SYNCHRONIZE ?? (isProduction ? 'false' : 'true')).toLowerCase() === 'true';
        const useSsl = (process.env.RDS_PG_SSL ?? (isProduction ? 'true' : 'false')).toLowerCase() === 'true';

        return {
          type: 'postgres',
          host,
          port: Number.isNaN(parsedPort) ? 5432 : parsedPort,
          username,
          password,
          database,
          entities: [Cart, CartItem, Order],
          synchronize,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}