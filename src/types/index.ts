export type Language = "c" | "cpp" | "java" | "python";

export interface Attachment {
  id: string;
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface SubTopic {
  id: string;
  name: string;
  solutions: Partial<Record<Language, string>>;
  attachments: Attachment[];
  createdAt: string;
}

export interface MasterTopic {
  id: string;
  name: string;
  topics: SubTopic[];
  createdAt: string;
}

export interface AddMasterTopicPayload {
  name: string;
}

export interface AddTopicPayload {
  masterTopicId: string;
  name: string;
  language?: Language;
  code?: string;
  attachment?: {
    fileId: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
}

export interface UpdateSolutionPayload {
  masterTopicId: string;
  topicId: string;
  language: Language;
  code: string;
}

export interface UpdateSubTopicPayload {
  topicId: string;
  sourceMasterTopicId: string;
  targetMasterTopicId: string;
  name: string;
}

export interface DeleteSubTopicPayload {
  masterTopicId: string;
  topicId: string;
}

/** @deprecated Use SubTopic */
export interface Topic extends SubTopic {}
