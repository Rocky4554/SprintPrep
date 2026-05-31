"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { SubTopic } from "@/types";
import {
  useCreateMasterTopic,
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
  const createMasterMutation = useCreateMasterTopic();

  const [name, setName] = useState(topic.name);
  const [targetMasterTopicId, setTargetMasterTopicId] = useState(masterTopicId);
  const [showNewMaster, setShowNewMaster] = useState(false);
  const [newMasterName, setNewMasterName] = useState("");
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

  async function handleCreateMaster() {
    const trimmed = newMasterName.trim();
    if (!trimmed) {
      setError("Enter a name for the new master topic.");
      return;
    }

    setError("");

    try {
      const created = await createMasterMutation.mutateAsync({ name: trimmed });
      setTargetMasterTopicId(created.id);
      setNewMasterName("");
      setShowNewMaster(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create master topic");
    }
  }

  const isLoading =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    createMasterMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel modal-panel--sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-1 mt-2 h-1 w-10 rounded-full bg-slate-300 sm:hidden" />
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Edit Problem</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100 active:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="edit-master"
                className="block text-sm font-medium text-slate-700"
              >
                Master Topic
              </label>
              {!showNewMaster && (
                <button
                  type="button"
                  onClick={() => {
                    setShowNewMaster(true);
                    setError("");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New master topic
                </button>
              )}
            </div>

            {showNewMaster ? (
              <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <input
                  type="text"
                  value={newMasterName}
                  onChange={(event) => setNewMasterName(event.target.value)}
                  placeholder="e.g. Stack, String, DP"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateMaster}
                    disabled={createMasterMutation.isPending}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {createMasterMutation.isPending ? "Creating..." : "Create & Select"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewMaster(false);
                      setNewMasterName("");
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <select
                id="edit-master"
                value={targetMasterTopicId}
                onChange={(event) => setTargetMasterTopicId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {masterTopics.map((master) => (
                  <option key={master.id} value={master.id}>
                    {master.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 active:bg-red-50 disabled:opacity-60"
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
