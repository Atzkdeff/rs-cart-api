import { Column, Model, Table } from 'sequelize-typescript';

import { Cart } from './cart.model';

@Table
export class CartItem extends Model {
  @Column({
    primaryKey: true,
    validate: {isUUID: 3},
    references: {
      model: Cart,
      key: 'id'
    }})
  cart_id: string;

  @Column({validate: {isUUID: 3}})
  product_id: string;

  @Column({validate: {isInt: true}})
  count: string;
}