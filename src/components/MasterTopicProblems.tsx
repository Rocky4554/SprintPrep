"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Language, SubTopic } from "@/types";
import {
  useDeleteAllSubTopics,
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
  const deleteAllMutation = useDeleteAllSubTopics();

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

  async function handleDeleteAll() {
    if (!masterTopic) return;
    if (
      !confirm(
        `Delete all ${masterTopic.topics.length} problems under "${masterTopic.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteAllMutation.mutateAsync(masterTopicId);
    } catch {
      // error surfaced via mutation state if needed
    }
  }

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
          <div className="flex flex-wrap items-center gap-2">
            {masterTopic.topics.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={deleteAllMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deleteAllMutation.isPending ? "Deleting..." : "Delete All"}
              </button>
            )}
            <button
              type="button"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              ASCII Table
            </button>
          </div>
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
          <ul className="space-y-4">
            {masterTopic.topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onLanguageClick={handleLanguageClick}
                onEditClick={setEditTopic}
              />
            ))}
          </ul>
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
