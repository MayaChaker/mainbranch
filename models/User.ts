import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: { type: String },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]{3,20}$/,
    },
    headline: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    skills: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export type UserDoc = InferSchemaType<typeof userSchema>;
export const User: Model<UserDoc> =
  models.User ?? model<UserDoc>("User", userSchema);
