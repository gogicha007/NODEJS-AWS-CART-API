import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cart/entities/cart-items.entity';
import { Order } from 'src/order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const parsedPort = Number.parseInt(process.env.RDS_PG_PORT ?? '', 10);
        const isProduction = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
        const synchronize = (process.env.TYPEORM_SYNCHRONIZE ?? (isProduction ? 'false' : 'true')).toLowerCase() === 'true';

        return {
          type: 'postgres',
          host: process.env.RDS_PG_HOST,
          port: Number.isNaN(parsedPort) ? 5432 : parsedPort,
          username: process.env.RDS_PG_USERNAME,
          password: process.env.RDS_PG_PASSWORD,
          database: process.env.RDS_PG_DATABASE,
          entities: [Cart, CartItem, Order],
          synchronize,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}