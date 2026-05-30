import { NextResponse } from "next/server";
import { isAllowedFile, uploadAttachment } from "@/lib/gridfs";
import { addTopicSolution, getMasterTopics, updateTopicSolution } from "@/lib/storage";
import type { AddTopicPayload, Language, UpdateSolutionPayload } from "@/types";

const VALID_LANGUAGES: Language[] = ["c", "cpp", "java", "python"];

export async function GET() {
  try {
    const masterTopics = await getMasterTopics();
    return NextResponse.json(masterTopics);
  } catch {
    return NextResponse.json({ error: "Failed to load topics." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const masterTopicId = String(formData.get("masterTopicId") ?? "");
      const name = String(formData.get("name") ?? "");
      const language = formData.get("language") as Language | null;
      const code = String(formData.get("code") ?? "");
      const file = formData.get("file");

      const payload: AddTopicPayload = { masterTopicId, name };

      if (code.trim()) {
        if (!language || !VALID_LANGUAGES.includes(language)) {
          return NextResponse.json({ error: "Invalid language." }, { status: 400 });
        }
        payload.language = language;
        payload.code = code;
      }

      if (file instanceof File && file.size > 0) {
        if (!isAllowedFile(file)) {
          return NextResponse.json(
            { error: "Only PDF, Word (.doc/.docx), and text files are allowed." },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadAttachment(
          buffer,
          file.name,
          file.type || "application/octet-stream"
        );

        payload.attachment = {
          fileId: uploaded.fileId.toString(),
          originalName: uploaded.originalName,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        };
      }

      const topic = await addTopicSolution(payload);
      return NextResponse.json(topic, { status: 201 });
    }

    const body = (await request.json()) as AddTopicPayload;

    if (!body.masterTopicId) {
      return NextResponse.json(
        { error: "Please select a master topic." },
        { status: 400 }
      );
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Topic name is required." }, { status: 400 });
    }

    if (body.code?.trim()) {
      if (!body.language || !VALID_LANGUAGES.includes(body.language)) {
        return NextResponse.json({ error: "Invalid language." }, { status: 400 });
      }
    }

    const topic = await addTopicSolution(body);
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save topic.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateSolutionPayload;

    if (!body.masterTopicId || !body.topicId) {
      return NextResponse.json(
        { error: "Master topic and topic id are required." },
        { status: 400 }
      );
    }

    if (!body.code?.trim()) {
      return NextResponse.json({ error: "Solution code is required." }, { status: 400 });
    }

    if (!VALID_LANGUAGES.includes(body.language)) {
      return NextResponse.json({ error: "Invalid language." }, { status: 400 });
    }

    const topic = await updateTopicSolution(body);
    return NextResponse.json(topic);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update solution.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
