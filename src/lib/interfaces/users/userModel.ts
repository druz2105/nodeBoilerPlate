import { Document } from "mongodb";

export interface UserModelInterface extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  active: boolean;
  createdAt: number;
  lastLogin: number | null;
}

export interface CreateUserInterface {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export interface UpdateUserInterface {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  active?: boolean;
  [key: string]: any;
}

export interface CreateJWTTokenInterface {
  _id: string;
  username?: string;
  email?: string;
  lastLogin: string;
  password?: string;
  [key: string]: any;
}

export interface UserLoginInterface {
  username?: string;
  email?: string;
  password: string;
  [key: string]: any;
}
