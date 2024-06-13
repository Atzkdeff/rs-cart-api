import { AllowNull, Column, DataType, Default, HasMany, IsIn, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { CartItem } from './cart-item.model';

enum CartStatus {
  OPEN = "OPEN",
  ORDERED = "ORDERED",
}


@Table({modelName: "Cart",tableName: "carts",timestamps: false})
export class Cart extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;


  @AllowNull(false)
  @Column(DataType.STRING)
  user_id: string;

  @AllowNull(false)
  @Default(CartStatus.OPEN)
  @IsIn([[CartStatus.OPEN, CartStatus.ORDERED]])
  @Column(DataType.STRING)
  status: string;

  @HasMany(() => CartItem)
  cartItems: CartItem[];
}