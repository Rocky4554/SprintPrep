import { NextResponse } from "next/server";
import { Readable } from "stream";
import { downloadAttachment } from "@/lib/gridfs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const file = await downloadAttachment(fileId);

    if (!file) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const webStream = Readable.toWeb(file.stream) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
        "Content-Length": String(file.size),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load file." }, { status: 500 });
  }
}
