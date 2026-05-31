"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Language, SubTopic } from "@/types";
import {
  useDeleteSelectedSubTopics,
  useDeleteSubTopic,
  useMasterTopic,
} from "@/hooks/useTopics";
import TopicRow from "./TopicRow";
import SolutionModal from "./SolutionModal";
import EditProblemModal from "./EditProblemModal";

interface MasterTopicProblemsProps {
  masterTopicId: string;
}

export default function MasterTopicProblems({
  masterTopicId,
}: MasterTopicProblemsProps) {
  const { data: masterTopic, isLoading, error } = useMasterTopic(masterTopicId);
  const deleteMutation = useDeleteSubTopic();
  const deleteSelectedMutation = useDeleteSelectedSubTopics();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [solutionModal, setSolutionModal] = useState<{
    topicId: string;
    topicName: string;
    language: Language;
    code: string;
  } | null>(null);
  const [editTopic, setEditTopic] = useState<SubTopic | null>(null);

  function handleLanguageClick(topic: SubTopic, language: Language) {
    const code = topic.solutions[language];
    if (!code) return;
    setSolutionModal({
      topicId: topic.id,
      topicName: topic.name,
      language,
      code,
    });
  }

  function handleSelectChange(topicId: string, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(topicId);
      else next.delete(topicId);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    if (!masterTopic) return;
    if (checked) {
      setSelectedIds(new Set(masterTopic.topics.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  async function handleDeleteOne(topic: SubTopic) {
    if (!confirm(`Delete "${topic.name}"? This cannot be undone.`)) return;

    try {
      await deleteMutation.mutateAsync({ masterTopicId, topicId: topic.id });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(topic.id);
        return next;
      });
    } catch {
      // mutation error
    }
  }

  async function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (
      !confirm(
        `Delete ${ids.length} selected ${ids.length === 1 ? "problem" : "problems"}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteSelectedMutation.mutateAsync({ masterTopicId, topicIds: ids });
      setSelectedIds(new Set());
    } catch {
      // mutation error
    }
  }

  const allSelected =
    masterTopic &&
    masterTopic.topics.length > 0 &&
    selectedIds.size === masterTopic.topics.length;

  const isDeleting = deleteMutation.isPending || deleteSelectedMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (error || !masterTopic) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error?.message || "Topic not found."}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{masterTopic.name}</h2>
            <p className="text-sm text-slate-500">
              {masterTopic.topics.length}{" "}
              {masterTopic.topics.length === 1 ? "problem" : "problems"} — click a
              language to view the solution
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            ASCII Table
          </button>
        </div>

        {masterTopic.topics.length === 0 ? (
          <p className="py-12 text-center text-slate-500">
            No problems added yet under {masterTopic.name}. Go to{" "}
            <a href="/add" className="font-medium text-emerald-600 hover:underline">
              + Add
            </a>{" "}
            to add one.
          </p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => handleSelectAll(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Select all
              </label>

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting
                    ? "Deleting..."
                    : `Delete Selected (${selectedIds.size})`}
                </button>
              )}
            </div>

            <ul className="space-y-4">
              {masterTopic.topics.map((topic) => (
                <TopicRow
                  key={topic.id}
                  topic={topic}
                  selected={selectedIds.has(topic.id)}
                  onSelectChange={handleSelectChange}
                  onLanguageClick={handleLanguageClick}
                  onEditClick={setEditTopic}
                  onDeleteClick={handleDeleteOne}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      {solutionModal && (
        <SolutionModal
          topicName={solutionModal.topicName}
          topicId={solutionModal.topicId}
          masterTopicId={masterTopicId}
          language={solutionModal.language}
          code={solutionModal.code}
          onClose={() => setSolutionModal(null)}
        />
      )}

      {editTopic && (
        <EditProblemModal
          topic={editTopic}
          masterTopicId={masterTopicId}
          onClose={() => setEditTopic(null)}
        />
      )}
    </>
  );
}
