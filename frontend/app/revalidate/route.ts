import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags } = body;
    if (Array.isArray(tags)) {
      tags.forEach((tag) => {
        revalidateTag(tag, { expire: 0 });
      });
      return NextResponse.json({ revalidated: true, tags, now: Date.now() });
    }
  } catch (e: any) {
    return NextResponse.json({ revalidated: false, error: e.message }, { status: 500 });
  }
  return NextResponse.json({ revalidated: false });
}
