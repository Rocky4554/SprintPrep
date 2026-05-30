import { NextResponse } from "next/server";
import { addMasterTopic, getMasterTopics } from "@/lib/storage";
import type { AddMasterTopicPayload } from "@/types";

export async function GET() {
  try {
    const masterTopics = await getMasterTopics();
    return NextResponse.json(masterTopics);
  } catch {
    return NextResponse.json(
      { error: "Failed to load master topics." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AddMasterTopicPayload;

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Master topic name is required." },
        { status: 400 }
      );
    }

    const masterTopic = await addMasterTopic(body);
    return NextResponse.json(masterTopic, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save master topic.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
