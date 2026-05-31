import { NextResponse } from "next/server";
import { deleteSubTopics } from "@/lib/storage";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { topicIds?: string[] };

    if (!body.topicIds?.length) {
      return NextResponse.json(
        { error: "Select at least one problem to delete." },
        { status: 400 }
      );
    }

    await deleteSubTopics(id, body.topicIds);
    return NextResponse.json({ success: true, deleted: body.topicIds.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete selected problems.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
