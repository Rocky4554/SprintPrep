import type {
  AddMasterTopicPayload,
  AddTopicPayload,
  Language,
  MasterTopic,
  SubTopic,
  UpdateSolutionPayload,
  UpdateSubTopicPayload,
} from "@/types";

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => ({}));
  return (data as { error?: string }).error ?? "Request failed";
}

export async function fetchMasterTopics(): Promise<MasterTopic[]> {
  const res = await fetch("/api/master-topics");
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function fetchMasterTopic(id: string): Promise<MasterTopic> {
  const res = await fetch(`/api/master-topics/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createMasterTopic(payload: AddMasterTopicPayload): Promise<MasterTopic> {
  const res = await fetch("/api/master-topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createTopic(payload: FormData | AddTopicPayload): Promise<SubTopic> {
  const isFormData = payload instanceof FormData;
  const res = await fetch("/api/topics", {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? payload : JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateSolution(payload: UpdateSolutionPayload): Promise<SubTopic> {
  const res = await fetch("/api/topics", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateSubTopic(payload: UpdateSubTopicPayload): Promise<{
  subTopic: SubTopic;
  masterTopicId: string;
  previousMasterTopicId: string;
}> {
  const res = await fetch(`/api/topics/${payload.topicId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteSubTopic(
  masterTopicId: string,
  topicId: string
): Promise<void> {
  const res = await fetch(`/api/topics/${topicId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ masterTopicId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function deleteSelectedSubTopics(
  masterTopicId: string,
  topicIds: string[]
): Promise<void> {
  const res = await fetch(`/api/master-topics/${masterTopicId}/topics`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicIds }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export type { Language };
