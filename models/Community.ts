import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";
import { TOPICS } from "@/constants/topics";

const communitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    topics: { type: [{ type: String, enum: [...TOPICS] }], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export type CommunityDoc = InferSchemaType<typeof communitySchema>;

export const Community: Model<CommunityDoc> =
  models.Community ?? model<CommunityDoc>("Community", communitySchema);
