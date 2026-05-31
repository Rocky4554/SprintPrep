import { NextResponse } from "next/server";
import { deleteAllSubTopics } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteAllSubTopics(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete all problems.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
