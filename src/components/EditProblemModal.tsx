"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import type { SubTopic } from "@/types";
import {
  useDeleteSubTopic,
  useMasterTopics,
  useUpdateSubTopic,
} from "@/hooks/useTopics";

interface EditProblemModalProps {
  topic: SubTopic;
  masterTopicId: string;
  onClose: () => void;
}

export default function EditProblemModal({
  topic,
  masterTopicId,
  onClose,
}: EditProblemModalProps) {
  const router = useRouter();
  const { data: masterTopics = [] } = useMasterTopics();
  const updateMutation = useUpdateSubTopic();
  const deleteMutation = useDeleteSubTopic();

  const [name, setName] = useState(topic.name);
  const [targetMasterTopicId, setTargetMasterTopicId] = useState(masterTopicId);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const result = await updateMutation.mutateAsync({
        topicId: topic.id,
        sourceMasterTopicId: masterTopicId,
        targetMasterTopicId,
        name,
      });

      onClose();
      if (result.masterTopicId !== masterTopicId) {
        router.push(`/topics/${result.masterTopicId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${topic.name}"? This cannot be undone.`)) return;
    setError("");

    try {
      await deleteMutation.mutateAsync({ masterTopicId, topicId: topic.id });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Edit Problem</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="edit-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Problem Name
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="edit-master"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Master Topic
            </label>
            <select
              id="edit-master"
              value={targetMasterTopicId}
              onChange={(event) => setTargetMasterTopicId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {masterTopics.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
