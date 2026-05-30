import { promises as fs } from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import { mapMasterTopic, mapSubTopic } from "@/lib/serializers";
import { MasterTopicModel, type SubTopicDocument } from "@/models/MasterTopic";
import mongoose from "mongoose";
import type {
  AddMasterTopicPayload,
  AddTopicPayload,
  Language,
  MasterTopic,
  SubTopic,
  UpdateSolutionPayload,
} from "@/types";

const SEED_SUBTOPICS = [
  "Positive or Negative number",
  "Even or Odd number",
  "Sum of First N Natural numbers",
  "Sum of N natural numbers",
  "Sum of numbers in a given range",
  "Greatest of two numbers",
  "Greatest of the Three numbers",
];

const DATA_DIR = path.join(process.cwd(), "data");
const LEGACY_MASTER_FILE = path.join(DATA_DIR, "master-topics.json");
const LEGACY_TOPICS_FILE = path.join(DATA_DIR, "topics.json");

async function migrateFromJsonFiles(): Promise<boolean> {
  try {
    const raw = await fs.readFile(LEGACY_MASTER_FILE, "utf-8");
    const parsed = JSON.parse(raw) as MasterTopic[];
    if (!Array.isArray(parsed) || parsed.length === 0) return false;

    await MasterTopicModel.insertMany(
      parsed.map((master) => ({
        name: master.name,
        createdAt: master.createdAt ? new Date(master.createdAt) : new Date(),
        topics: master.topics.map((topic) => ({
          name: topic.name,
          solutions: topic.solutions ?? {},
          attachments: [],
          createdAt: topic.createdAt ? new Date(topic.createdAt) : new Date(),
        })),
      }))
    );
    return true;
  } catch {
    try {
      const raw = await fs.readFile(LEGACY_TOPICS_FILE, "utf-8");
      const legacy = JSON.parse(raw) as SubTopic[];
      if (!Array.isArray(legacy) || legacy.length === 0) return false;

      await MasterTopicModel.create({
        name: "Basics",
        topics: legacy.map((topic) => ({
          name: topic.name,
          solutions: topic.solutions ?? {},
          attachments: [],
          createdAt: topic.createdAt ? new Date(topic.createdAt) : new Date(),
        })),
      });
      return true;
    } catch {
      return false;
    }
  }
}

async function ensureSeedData(): Promise<void> {
  const count = await MasterTopicModel.countDocuments();
  if (count > 0) return;

  const migrated = await migrateFromJsonFiles();
  if (migrated) return;

  await MasterTopicModel.create({
    name: "Basics",
    topics: SEED_SUBTOPICS.map((name) => ({
      name,
      solutions: {},
      attachments: [],
    })),
  });
}

async function initDB(): Promise<void> {
  await connectDB();
  await ensureSeedData();
}

export async function getMasterTopics(): Promise<MasterTopic[]> {
  await initDB();
  const docs = await MasterTopicModel.find().sort({ createdAt: 1 }).lean();
  return docs.map((doc) => mapMasterTopic(doc as never));
}

export async function getMasterTopicById(id: string): Promise<MasterTopic | null> {
  await initDB();
  const doc = await MasterTopicModel.findById(id).lean();
  if (!doc) return null;
  return mapMasterTopic(doc as never);
}

export async function addMasterTopic(
  payload: AddMasterTopicPayload
): Promise<MasterTopic> {
  const name = payload.name.trim();
  if (!name) throw new Error("Master topic name is required.");

  await initDB();

  const existing = await MasterTopicModel.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
  });
  if (existing) throw new Error("A master topic with this name already exists.");

  const doc = await MasterTopicModel.create({ name, topics: [] });
  return mapMasterTopic(doc.toObject() as never);
}

export async function addTopicSolution(payload: AddTopicPayload): Promise<SubTopic> {
  const normalizedName = payload.name.trim();
  const hasCode = Boolean(payload.code?.trim());
  const hasAttachment = Boolean(payload.attachment);

  if (!normalizedName) {
    throw new Error("Topic name is required.");
  }
  if (!hasCode && !hasAttachment) {
    throw new Error("Add solution code or attach a notes file.");
  }
  if (hasCode && !payload.language) {
    throw new Error("Please select a language for the code solution.");
  }
  if (!payload.masterTopicId) {
    throw new Error("Please select a master topic.");
  }

  await initDB();

  const master = await MasterTopicModel.findById(payload.masterTopicId);
  if (!master) throw new Error("Master topic not found.");

  let topic = master.topics.find(
    (item: SubTopicDocument) =>
      item.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (!topic) {
    master.topics.push({
      name: normalizedName,
      solutions: {},
      attachments: [],
      createdAt: new Date(),
    } as never);
    topic = master.topics[master.topics.length - 1];
  }

  if (hasCode && payload.language) {
    topic.solutions[payload.language] = payload.code!.trim();
  }

  if (hasAttachment && payload.attachment) {
    topic.attachments.push({
      fileId: new mongoose.Types.ObjectId(payload.attachment.fileId),
      originalName: payload.attachment.originalName,
      mimeType: payload.attachment.mimeType,
      size: payload.attachment.size,
      uploadedAt: new Date(),
    } as never);
  }

  await master.save();

  const savedTopic = master.topics.find(
    (item: SubTopicDocument) =>
      item.name.toLowerCase() === normalizedName.toLowerCase()
  );
  if (!savedTopic) throw new Error("Failed to save topic.");

  return mapSubTopic(savedTopic.toObject() as never);
}

export async function updateTopicSolution(
  payload: UpdateSolutionPayload
): Promise<SubTopic> {
  if (!payload.code.trim()) {
    throw new Error("Solution code cannot be empty.");
  }

  await initDB();

  const master = await MasterTopicModel.findById(payload.masterTopicId);
  if (!master) throw new Error("Master topic not found.");

  const topic = master.topics.id(payload.topicId);
  if (!topic) throw new Error("Topic not found.");

  topic.solutions[payload.language] = payload.code.trim();
  await master.save();

  return mapSubTopic(topic.toObject() as never);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
