import type {
  Attachment,
  Language,
  MasterTopic,
  SubTopic,
} from "@/types";
import type {
  AttachmentDocument,
  MasterTopicDocument,
  SubTopicDocument,
} from "@/models/MasterTopic";

function toIso(date: Date | string): string {
  return date instanceof Date ? date.toISOString() : String(date);
}

export function mapAttachment(doc: AttachmentDocument): Attachment {
  return {
    id: doc._id.toString(),
    fileId: doc.fileId.toString(),
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedAt: toIso(doc.uploadedAt),
  };
}

export function mapSubTopic(doc: SubTopicDocument): SubTopic {
  const solutions: SubTopic["solutions"] = {};
  const raw = (doc.solutions ?? {}) as Record<Language, string | undefined>;

  if (raw.c) solutions.c = raw.c;
  if (raw.cpp) solutions.cpp = raw.cpp;
  if (raw.java) solutions.java = raw.java;
  if (raw.python) solutions.python = raw.python;

  return {
    id: doc._id.toString(),
    name: doc.name,
    solutions,
    attachments: (doc.attachments ?? []).map(mapAttachment),
    createdAt: toIso(doc.createdAt),
  };
}

export function mapMasterTopic(doc: MasterTopicDocument): MasterTopic {
  return {
    id: doc._id.toString(),
    name: doc.name,
    topics: doc.topics.map(mapSubTopic),
    createdAt: toIso(doc.createdAt),
  };
}

export function pickLanguageSolution(
  solutions: SubTopicDocument["solutions"] | null | undefined,
  language: Language
): string | undefined {
  const code = solutions?.[language];
  return code?.trim() ? code : undefined;
}
