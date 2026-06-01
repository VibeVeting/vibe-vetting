import { ObjectId } from "mongodb";

// Notification preferences
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  weekly: boolean;
}

// User types
export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  company?: string;
  twoFactorEnabled?: boolean;
  image?: string;
  currentPlan?: string; // Current subscription plan id (starter, growth, enterprise)
  planUpdatedAt?: Date; // When the plan was last changed
  notificationPreferences?: NotificationPreferences; // User's notification settings
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<User, "_id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<Omit<User, "_id" | "createdAt">>;

// Notification types
export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  body: string;
  type?: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  metadata?: Record<string, unknown>;
}

