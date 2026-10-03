import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const bookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ postId: 1 });
export type BookmarkDoc = InferSchemaType<typeof bookmarkSchema>;

export const Bookmark: Model<BookmarkDoc> =
  models.Bookmark ?? model<BookmarkDoc>("Bookmark", bookmarkSchema);
