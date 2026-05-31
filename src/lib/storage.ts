import { promises as fs } from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import { deleteAttachment } from "@/lib/gridfs";
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
  UpdateSubTopicPayload,
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

async function deleteSubTopicAttachments(topic: SubTopicDocument): Promise<void> {
  for (const file of topic.attachments ?? []) {
    try {
      await deleteAttachment(file.fileId.toString());
    } catch {
      // ignore missing files in gridfs
    }
  }
}

export async function updateSubTopicMeta(
  payload: UpdateSubTopicPayload
): Promise<{ subTopic: SubTopic; masterTopicId: string; previousMasterTopicId: string }> {
  const name = payload.name.trim();
  if (!name) throw new Error("Problem name is required.");

  await initDB();

  const source = await MasterTopicModel.findById(payload.sourceMasterTopicId);
  if (!source) throw new Error("Source master topic not found.");

  const topic = source.topics.id(payload.topicId);
  if (!topic) throw new Error("Problem not found.");

  const previousMasterTopicId = payload.sourceMasterTopicId;

  if (payload.sourceMasterTopicId === payload.targetMasterTopicId) {
    const duplicate = source.topics.find(
      (item: SubTopicDocument) =>
        item._id.toString() !== payload.topicId &&
        item.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) throw new Error("A problem with this name already exists in this topic.");

    topic.name = name;
    await source.save();
    return {
      subTopic: mapSubTopic(topic.toObject() as never),
      masterTopicId: payload.targetMasterTopicId,
      previousMasterTopicId,
    };
  }

  const target = await MasterTopicModel.findById(payload.targetMasterTopicId);
  if (!target) throw new Error("Target master topic not found.");

  const duplicate = target.topics.find(
    (item: SubTopicDocument) => item.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) throw new Error("A problem with this name already exists in the target topic.");

  const topicObject = topic.toObject();
  source.topics.pull(payload.topicId);
  await source.save();

  target.topics.push({
    ...topicObject,
    name,
    _id: topic._id,
  } as never);
  await target.save();

  const moved = target.topics.id(payload.topicId);
  if (!moved) throw new Error("Failed to move problem.");

  return {
    subTopic: mapSubTopic(moved.toObject() as never),
    masterTopicId: payload.targetMasterTopicId,
    previousMasterTopicId,
  };
}

export async function deleteSubTopic(
  masterTopicId: string,
  topicId: string
): Promise<void> {
  await initDB();

  const master = await MasterTopicModel.findById(masterTopicId);
  if (!master) throw new Error("Master topic not found.");

  const topic = master.topics.id(topicId);
  if (!topic) throw new Error("Problem not found.");

  await deleteSubTopicAttachments(topic);
  master.topics.pull(topicId);
  await master.save();
}

export async function deleteAllSubTopics(masterTopicId: string): Promise<void> {
  await initDB();

  const master = await MasterTopicModel.findById(masterTopicId);
  if (!master) throw new Error("Master topic not found.");

  for (const topic of master.topics) {
    await deleteSubTopicAttachments(topic);
  }

  master.topics = [];
  await master.save();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
