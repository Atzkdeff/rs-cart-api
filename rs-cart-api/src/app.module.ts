import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { Cart } from './cart/models/cart.model';
import { CartItem } from './cart/models/cart-item.model';

@Module({
  imports: [
    AuthModule,
    CartModule,
    OrderModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadModels: true,
      synchronize: true, // set this to `false` in prod
      models: [Cart, CartItem]
    }),
  ],
  controllers: [
    AppController,
  ],
  providers: [],
})
export class AppModule {}
