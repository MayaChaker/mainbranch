import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { Community } from "@/models/Community";

export type PostPreview = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string;
  authorName: string;
  community: { name: string; slug: string };
};

export async function listLatestPosts(limit: number): Promise<PostPreview[]> {
  return Post.aggregate<PostPreview>([
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: User.collection.name,
        localField: "authorId",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 0, name: 1, username: 1 } }],
        as: "author",
      },
    },
    {
      $lookup: {
        from: Community.collection.name,
        localField: "communityId",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 0, name: 1, slug: 1 } }],
        as: "community",
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        title: 1,
        slug: 1,
        excerpt: 1,
        createdAt: { $dateToString: { date: "$createdAt" } },
        authorName: {
          $ifNull: [
            { $first: "$author.name" },
            { $ifNull: [{ $first: "$author.username" }, "A developer"] },
          ],
        },
        community: { $first: "$community" },
      },
    },
  ]);
}
