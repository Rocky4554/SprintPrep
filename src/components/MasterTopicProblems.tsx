"use client";

import { useEffect, useState } from "react";
import type { Language, MasterTopic, SubTopic } from "@/types";
import TopicRow from "./TopicRow";
import SolutionModal from "./SolutionModal";

interface MasterTopicProblemsProps {
  masterTopicId: string;
}

export default function MasterTopicProblems({
  masterTopicId,
}: MasterTopicProblemsProps) {
  const [masterTopic, setMasterTopic] = useState<MasterTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{
    topicId: string;
    topicName: string;
    language: Language;
    code: string;
  } | null>(null);

  async function loadMasterTopic() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/master-topics/${masterTopicId}`);
      if (!response.ok) throw new Error("Not found");
      const data = (await response.json()) as MasterTopic;
      setMasterTopic(data);
    } catch {
      setError("Could not load this topic. It may have been removed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasterTopic();
  }, [masterTopicId]);

  function handleLanguageClick(topic: SubTopic, language: Language) {
    const code = topic.solutions[language];
    if (!code) return;
    setModal({ topicId: topic.id, topicName: topic.name, language, code });
  }

  function handleSolutionSaved(updatedCode: string) {
    if (!modal) return;

    setMasterTopic((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics.map((topic) =>
          topic.id === modal.topicId
            ? { ...topic, solutions: { ...topic.solutions, [modal.language]: updatedCode } }
            : topic
        ),
      };
    });
    setModal((prev) => (prev ? { ...prev, code: updatedCode } : null));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (error || !masterTopic) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {error || "Topic not found."}
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
          <ul className="space-y-4">
            {masterTopic.topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onLanguageClick={handleLanguageClick}
              />
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <SolutionModal
          topicName={modal.topicName}
          topicId={modal.topicId}
          masterTopicId={masterTopicId}
          language={modal.language}
          code={modal.code}
          onClose={() => setModal(null)}
          onSaved={handleSolutionSaved}
        />
      )}
    </>
  );
}
