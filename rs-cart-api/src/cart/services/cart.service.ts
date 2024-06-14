import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { v4 } from 'uuid';

import { Cart } from '../models/cart.model';
import { CartItem } from '../models/cart-item.model';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart) private cartModel: typeof Cart,
    @InjectModel(CartItem) private cartItemModel: typeof CartItem,
    private sequelize: Sequelize
  ) {}

  findByUserId(userId: string): Promise<Cart> {
    return this.cartModel.findOne({
      where: { user_id: userId },
      include: [CartItem]  // also fetch the associated CartItems
    });
  }

  createByUserId(userId: string): Promise<Cart> {
    return this.cartModel.create({ user_id: v4() });
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  updateByUserId(userId: string, { cartItems }: Cart): Promise<Cart> {
    return this.sequelize.transaction(async (t) => {
      const userCart = await this.findOrCreateByUserId(userId);

      const items = cartItems.map((item) => ({
        ...item,
        cart_id: userCart.id,
      }));

      await this.cartItemModel.bulkCreate(items, {
        updateOnDuplicate: ["count"],
        transaction: t
      });

      return this.findByUserId(userId);
    });
  }

  async removeByUserId(userId): Promise<void> {
    const cart = await this.findByUserId(userId);
    cart.destroy();
  }
}
