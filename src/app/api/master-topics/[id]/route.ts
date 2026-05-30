import { NextResponse } from "next/server";
import { getMasterTopicById } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const masterTopic = await getMasterTopicById(id);

    if (!masterTopic) {
      return NextResponse.json({ error: "Master topic not found." }, { status: 404 });
    }

    return NextResponse.json(masterTopic);
  } catch {
    return NextResponse.json(
      { error: "Failed to load master topic." },
      { status: 500 }
    );
  }
}
