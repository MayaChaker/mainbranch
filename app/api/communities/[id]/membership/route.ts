import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { isMember, joinCommunity, leaveCommunity } from "@/lib/membership";
import { Community } from "@/models/Community";

type Context = { params: Promise<{ id: string }> };

const OBJECT_ID = /^[a-f0-9]{24}$/i;

type Target =
  | { ok: true; userId: string; communityId: string; slug: string }
  | { ok: false; response: Response };

async function resolveTarget(context: Context): Promise<Target> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in first." }, { status: 401 }),
    };
  }

  const notFound = {
    ok: false as const,
    response: NextResponse.json({ error: "Community not found." }, { status: 404 }),
  };
  const { id } = await context.params;
  if (!OBJECT_ID.test(id)) return notFound;

  await connectDB();
  const community = await Community.findById(id).select("slug").lean();
  if (!community) return notFound;

  return { ok: true, userId, communityId: id, slug: community.slug };
}

function refreshPages(slug: string) {
  revalidatePath(`/communities/${slug}`);
  revalidatePath("/");
}

export async function GET(_request: Request, context: Context) {
  const target = await resolveTarget(context);
  if (!target.ok) return target.response;

  return NextResponse.json({
    isMember: await isMember(target.userId, target.communityId),
  });
}

export async function POST(_request: Request, context: Context) {
  const target = await resolveTarget(context);
  if (!target.ok) return target.response;

  const { created } = await joinCommunity(target.userId, target.communityId);
  if (created) refreshPages(target.slug);
  return NextResponse.json({ isMember: true }, { status: created ? 201 : 200 });
}

export async function DELETE(_request: Request, context: Context) {
  const target = await resolveTarget(context);
  if (!target.ok) return target.response;

  await leaveCommunity(target.userId, target.communityId);
  refreshPages(target.slug);
  return new Response(null, { status: 204 });
}
