import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const commentSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
commentSchema.index({ postId: 1, createdAt: 1 });

export type CommentDoc = InferSchemaType<typeof commentSchema>;

export const Comment: Model<CommentDoc> =
  models.Comment ?? model<CommentDoc>("Comment", commentSchema);
