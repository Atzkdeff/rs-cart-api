import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { Cart } from './models/cart.model';
import { CartItem } from './models/cart-item.model';


@Module({
  imports: [ OrderModule, SequelizeModule.forFeature([Cart, CartItem]) ],
  providers: [ CartService ],
  controllers: [ CartController ]
})
export class CartModule {}
