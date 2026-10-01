import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const membershipSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
  },
  { timestamps: { createdAt: "joinedAt", updatedAt: false } },
);
membershipSchema.index({ userId: 1, communityId: 1 }, { unique: true });
membershipSchema.index({ communityId: 1, joinedAt: -1 });

export type MembershipDoc = InferSchemaType<typeof membershipSchema>;

export const Membership: Model<MembershipDoc> =
  models.Membership ?? model<MembershipDoc>("Membership", membershipSchema);
