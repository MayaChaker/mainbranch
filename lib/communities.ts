import type { PipelineStage } from "mongoose";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";
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
