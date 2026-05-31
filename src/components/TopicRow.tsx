"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Attachment, Language, SubTopic } from "@/types";
import { LANGUAGES } from "@/lib/languages";
import LanguageButton from "./LanguageButton";

interface TopicRowProps {
  topic: SubTopic;
  selected: boolean;
  onSelectChange: (topicId: string, selected: boolean) => void;
  onLanguageClick: (topic: SubTopic, language: Language) => void;
  onEditClick: (topic: SubTopic) => void;
  onDeleteClick: (topic: SubTopic) => void;
  onAttachmentClick: (topic: SubTopic, attachment: Attachment) => void;
}

export default function TopicRow({
  topic,
  selected,
  onSelectChange,
  onLanguageClick,
  onEditClick,
  onDeleteClick,
  onAttachmentClick,
}: TopicRowProps) {
  const attachments = topic.attachments ?? [];

  return (
    <li
      className={`rounded-xl border border-transparent px-3 py-4 transition sm:rounded-none sm:border-0 sm:px-0 sm:py-0 ${
        selected
          ? "border-red-200 bg-red-50/60"
          : "bg-white/60 sm:bg-transparent"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectChange(topic.id, event.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            aria-label={`Select ${topic.name}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold leading-snug text-slate-800 sm:font-medium">
              {topic.name}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEditClick(topic)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition active:scale-95 active:bg-slate-200 sm:h-8 sm:w-8 sm:rounded-full"
              aria-label={`Edit ${topic.name}`}
              title="Edit problem"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteClick(topic)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition active:scale-95 active:bg-red-100 sm:h-8 sm:w-8 sm:rounded-full"
              aria-label={`Delete ${topic.name}`}
              title="Delete problem"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pl-8 sm:flex sm:flex-wrap sm:items-center sm:gap-1 sm:pl-0">
          {LANGUAGES.map((lang, index) => {
            const hasSolution = Boolean(topic.solutions[lang.id]);
            return (
              <div key={lang.id} className="flex items-center sm:contents">
                {index > 0 && (
                  <span className="mx-1 hidden text-slate-300 select-none sm:inline">|</span>
                )}
                <LanguageButton
                  label={lang.label}
                  color={lang.color}
                  hoverColor={lang.hoverColor}
                  disabled={!hasSolution}
                  onClick={() => onLanguageClick(topic, lang.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pl-8 sm:pl-0">
          {attachments.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => onAttachmentClick(topic, file)}
              className="inline-flex max-w-full min-h-[40px] items-center gap-1.5 rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700 transition active:scale-95 active:bg-violet-200 sm:rounded-full sm:py-1"
            >
              <span className="shrink-0">📄</span>
              <span className="truncate">{file.originalName}</span>
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
