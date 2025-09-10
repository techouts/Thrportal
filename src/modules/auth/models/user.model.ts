import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';

interface UserAttrs {
  id: number;
  email: string;
  password: string | null;
  created_at?: Date;
}

type UserCreationAttrs = Optional<UserAttrs, 'id' | 'password' | 'created_at'>;

export class User extends Model<UserAttrs, UserCreationAttrs> implements UserAttrs {
  public id!: number;
  public email!: string;
  public password!: string | null;
  public created_at?: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);


