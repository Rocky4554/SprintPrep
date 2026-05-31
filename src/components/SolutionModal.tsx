"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Language } from "@/types";
import { LANGUAGE_LABELS } from "@/lib/languages";
import { useUpdateSolution } from "@/hooks/useTopics";

interface SolutionModalProps {
  topicName: string;
  topicId: string;
  masterTopicId: string;
  language: Language;
  code: string;
  onClose: () => void;
}

export default function SolutionModal({
  topicName,
  topicId,
  masterTopicId,
  language,
  code,
  onClose,
}: SolutionModalProps) {
  const updateMutation = useUpdateSolution();
  const [editedCode, setEditedCode] = useState(code);
  const [savedCode, setSavedCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isDirty = editedCode !== savedCode;

  const handleSave = useCallback(async () => {
    if (!isDirty || updateMutation.isPending) return;

    setSaveError("");

    try {
      await updateMutation.mutateAsync({
        masterTopicId,
        topicId,
        language,
        code: editedCode,
      });
      setSavedCode(editedCode);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    }
  }, [editedCode, isDirty, language, masterTopicId, topicId, updateMutation]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (isDirty) handleSave();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleSave, isDirty, onClose]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(editedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[94vh] w-[98vw] max-w-[1600px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-3 sm:px-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{topicName}</h3>
            <p className="text-sm text-slate-500">
              Solution in{" "}
              <span className="font-medium text-slate-700">
                {LANGUAGE_LABELS[language]}
              </span>
              {isDirty && (
                <span className="ml-2 text-amber-600">· unsaved changes</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-slate-900">
            <div className="flex shrink-0 items-center justify-end gap-2 px-5 py-3 sm:px-6">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-500 disabled:opacity-60"
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <textarea
              value={editedCode}
              onChange={(event) => setEditedCode(event.target.value)}
              spellCheck={false}
              className="no-scrollbar min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent px-5 pb-5 font-mono text-sm leading-snug text-emerald-100 outline-none sm:px-6 sm:pb-6 sm:text-[15px] sm:leading-relaxed"
            />
          </div>

          {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
          {isDirty && (
            <p className="mt-2 text-xs text-slate-400">Press Ctrl+S to save changes</p>
          )}
        </div>
      </div>
    </div>
  );
}
