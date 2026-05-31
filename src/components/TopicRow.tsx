"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Language, SubTopic } from "@/types";
import { LANGUAGES } from "@/lib/languages";
import LanguageButton from "./LanguageButton";

interface TopicRowProps {
  topic: SubTopic;
  selected: boolean;
  onSelectChange: (topicId: string, selected: boolean) => void;
  onLanguageClick: (topic: SubTopic, language: Language) => void;
  onEditClick: (topic: SubTopic) => void;
  onDeleteClick: (topic: SubTopic) => void;
}

export default function TopicRow({
  topic,
  selected,
  onSelectChange,
  onLanguageClick,
  onEditClick,
  onDeleteClick,
}: TopicRowProps) {
  const attachments = topic.attachments ?? [];

  return (
    <li
      className={`flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 ${
        selected ? "rounded-xl bg-red-50/40 px-2 -mx-2" : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectChange(topic.id, event.target.checked)}
            className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            aria-label={`Select ${topic.name}`}
          />
          <span className="text-base font-medium text-slate-800">
            {topic.name}
            <span className="text-slate-500">:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 pl-7 sm:pl-0">
          {LANGUAGES.map((lang, index) => {
            const hasSolution = Boolean(topic.solutions[lang.id]);
            return (
              <div key={lang.id} className="flex items-center">
                {index > 0 && (
                  <span className="mx-1 text-slate-300 select-none">|</span>
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
          <span className="mx-1 text-slate-300 select-none">|</span>
          <button
            type="button"
            onClick={() => onEditClick(topic)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label={`Edit ${topic.name}`}
            title="Edit problem"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick(topic)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
            aria-label={`Delete ${topic.name}`}
            title="Delete problem"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-7 sm:pl-7">
          {attachments.map((file) => (
            <a
              key={file.id}
              href={`/api/attachments/${file.fileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-200"
            >
              📄 {file.originalName}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}
