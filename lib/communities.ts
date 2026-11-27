import { Types, type PipelineStage } from "mongoose";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";
import { User } from "@/models/User";
import { escapeRegex } from "@/lib/escape-regex";
import type { CommunitiesQuery } from "@/schemas/communities";

export const PAGE_SIZE = 12;

export type CommunityListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  topics: string[];
  memberCount: number;
};

export type CommunityList = {
  items: CommunityListItem[];
  page: number;
  totalPages: number;
  total: number;
};

function withMemberCount(): PipelineStage[] {
  return [
    {
      $lookup: {
        from: Membership.collection.name,
        localField: "_id",
        foreignField: "communityId",
        pipeline: [{ $count: "count" }],
        as: "members",
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        name: 1,
        slug: 1,
        description: 1,
        topics: 1,
        memberCount: { $ifNull: [{ $first: "$members.count" }, 0] },
      },
    },
  ];
}

export async function listPopularCommunities(
  limit: number,
): Promise<CommunityListItem[]> {
  return Community.aggregate<CommunityListItem>([
    ...withMemberCount(),
    { $sort: { memberCount: -1, name: 1 } },
    { $limit: limit },
  ]);
}

function searchFilter(search?: string) {
  if (!search) return {};
  const pattern = new RegExp(escapeRegex(search), "i");
  return { $or: [{ name: pattern }, { description: pattern }] };
}

export async function listCommunities({
  search,
  page,
}: Partial<Pick<CommunitiesQuery, "search">> &
  Pick<CommunitiesQuery, "page">): Promise<CommunityList> {
  const filter = searchFilter(search);

  const pipeline: PipelineStage[] = [
    { $match: filter },
    { $sort: { name: 1, _id: 1 } },
    { $skip: (page - 1) * PAGE_SIZE },
    { $limit: PAGE_SIZE },
    ...withMemberCount(),
  ];

  const [items, total] = await Promise.all([
    Community.aggregate<CommunityListItem>(pipeline),
    Community.countDocuments(filter),
  ]);

  return {
    items,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export type MemberPreview = { id: string; name: string };

export async function getCommunityBySlug(
  slug: string,
): Promise<CommunityListItem | null> {
  const [community] = await Community.aggregate<CommunityListItem>([
    { $match: { slug: slug.toLowerCase() } },
    { $limit: 1 },
    ...withMemberCount(),
  ]);
  return community ?? null;
}

export async function listRecentMembers(
  communityId: string,
  limit: number,
): Promise<MemberPreview[]> {
  return Membership.aggregate<MemberPreview>([
    { $match: { communityId: new Types.ObjectId(communityId) } },
    { $sort: { joinedAt: -1, _id: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: User.collection.name,
        localField: "userId",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 0, name: 1, username: 1 } }],
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        id: { $toString: "$userId" },
        name: { $ifNull: ["$user.name", "$user.username"] },
      },
    },
  ]);
}
