import { NextResponse } from "next/server";
import {
  deleteSubTopic,
  updateSubTopicMeta,
} from "@/lib/storage";
import type { DeleteSubTopicPayload, UpdateSubTopicPayload } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const body = (await request.json()) as UpdateSubTopicPayload;

    if (!body.sourceMasterTopicId || !body.targetMasterTopicId || !body.name?.trim()) {
      return NextResponse.json(
        { error: "Problem name and master topics are required." },
        { status: 400 }
      );
    }

    const result = await updateSubTopicMeta({ ...body, topicId });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update problem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const body = (await request.json()) as DeleteSubTopicPayload;

    if (!body.masterTopicId) {
      return NextResponse.json(
        { error: "Master topic id is required." },
        { status: 400 }
      );
    }

    await deleteSubTopic(body.masterTopicId, topicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete problem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
