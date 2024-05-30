import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { v4 } from 'uuid';

import { ICart } from '../models';
import { Cart } from '../models/cart.model';

@Injectable()
export class CartService {
  private userCarts: Record<string, ICart> = {};

  constructor(@InjectModel(Cart) private cartModel: typeof Cart) {}

  findByUserId(userId: string): ICart {
    return this.userCarts[ userId ];
  }

  createByUserId(userId: string) {
    const id = v4(v4());
    const userCart = {
      id,
      items: [],
    };

    this.userCarts[ userId ] = userCart;

    return userCart;
  }

  findOrCreateByUserId(userId: string): ICart {
    const userCart = this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  updateByUserId(userId: string, { items }: ICart): ICart {
    const { id, ...rest } = this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      items: [ ...items ],
    }

    this.userCarts[ userId ] = { ...updatedCart };

    return { ...updatedCart };
  }

  removeByUserId(userId): void {
    this.userCarts[ userId ] = null;
  }

}

// https://docs.nestjs.com/techniques/database#sequelize-integration

//@Injectable()
// export class UsersService {
//   constructor(
//     @InjectModel(User)
//     private userModel: typeof User,
//   ) {}
//
//   async findAll(): Promise<User[]> {
//     return this.userModel.findAll();
//   }
//
//   findOne(id: string): Promise<User> {
//     return this.userModel.findOne({
//       where: {
//         id,
//       },
//     });
//   }
//
//   async remove(id: string): Promise<void> {
//     const user = await this.findOne(id);
//     await user.destroy();
//   }
// }