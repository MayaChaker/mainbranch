import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";
import { TOPICS } from "@/constants/topics";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    topics: { type: [{ type: String, enum: [...TOPICS] }], default: [] },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ communityId: 1, createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ topics: 1, createdAt: -1 });
postSchema.index({ title: "text", excerpt: "text" });

export type PostDoc = InferSchemaType<typeof postSchema>;

export const Post: Model<PostDoc> =
  models.Post ?? model<PostDoc>("Post", postSchema);
