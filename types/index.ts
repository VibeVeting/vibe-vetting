import { ObjectId } from "mongodb";

// User types
export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<User, "_id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<Omit<User, "_id" | "createdAt">>;
