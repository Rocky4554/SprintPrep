import mongoose, { Schema, type InferSchemaType, type Types } from "mongoose";

const AttachmentSchema = new Schema(
  {
    fileId: { type: Schema.Types.ObjectId, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const SubTopicSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    solutions: {
      c: { type: String, default: "" },
      cpp: { type: String, default: "" },
      java: { type: String, default: "" },
      python: { type: String, default: "" },
    },
    attachments: { type: [AttachmentSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const MasterTopicSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    topics: { type: [SubTopicSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export type AttachmentDocument = InferSchemaType<typeof AttachmentSchema> & {
  _id: Types.ObjectId;
};

export type SubTopicDocument = InferSchemaType<typeof SubTopicSchema> & {
  _id: Types.ObjectId;
  attachments: AttachmentDocument[];
};

export type MasterTopicDocument = InferSchemaType<typeof MasterTopicSchema> & {
  _id: Types.ObjectId;
  topics: SubTopicDocument[];
};

export const MasterTopicModel =
  mongoose.models.MasterTopic ??
  mongoose.model("MasterTopic", MasterTopicSchema);

export const ATTACHMENTS_BUCKET = "sprintprep_attachments";
