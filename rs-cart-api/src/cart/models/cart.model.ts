import { Column, DataType, Model, Table } from 'sequelize-typescript';

enum CartStatus {
  OPEN = "OPEN",
  ORDERED = "ORDERED",
}

@Table
export class Cart extends Model {
  @Column({primaryKey: true,validate: {isUUID: 3},})
  id: string;

  @Column({validate: {isUUID: 3}, allowNull: false})
  user_id: string;

  @Column({validate: {isDate: true}, allowNull: false})
  created_at: string;

  @Column({validate: {isDate: true}, allowNull: false})
  updated_at: string;

  @Column({ type: DataType.ENUM(...Object.values(CartStatus))})
  status: string;
}