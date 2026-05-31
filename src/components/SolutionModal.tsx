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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="truncate text-base font-semibold text-slate-900 sm:text-xl">
              {topicName}
            </h3>
            <p className="text-sm text-slate-500">
              {LANGUAGE_LABELS[language]}
              {isDirty && (
                <span className="ml-2 text-amber-600">· unsaved</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition active:bg-slate-100 active:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-slate-900">
            <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-3 sm:px-6">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition active:bg-blue-500 disabled:opacity-60"
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[44px] rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition active:bg-emerald-500"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <textarea
              value={editedCode}
              onChange={(event) => setEditedCode(event.target.value)}
              spellCheck={false}
              className="no-scrollbar min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent px-4 pb-4 font-mono text-[13px] leading-relaxed text-emerald-100 outline-none sm:px-6 sm:pb-6 sm:text-[15px]"
            />
          </div>

          {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
          {isDirty && (
            <p className="mt-2 hidden text-xs text-slate-400 sm:block">
              Press Ctrl+S to save changes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
