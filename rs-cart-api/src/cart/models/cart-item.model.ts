import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Cart } from './cart.model';

@Table({modelName: "CartItem", tableName: "cart_items", timestamps: false})
export class CartItem extends Model {
  @ForeignKey(() => Cart)
  @Column(DataType.UUID)
  cart_id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  product_id: string;

  @Column(DataType.INTEGER)
  count: number;

  @BelongsTo(() => Cart)
  cart: Cart;
}