"use client";

import type { Language, SubTopic } from "@/types";
import { LANGUAGES } from "@/lib/languages";
import LanguageButton from "./LanguageButton";

interface TopicRowProps {
  topic: SubTopic;
  onLanguageClick: (topic: SubTopic, language: Language) => void;
}

export default function TopicRow({ topic, onLanguageClick }: TopicRowProps) {
  const attachments = topic.attachments ?? [];

  return (
    <li className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
          <span className="text-base font-medium text-slate-800">
            {topic.name}
            <span className="text-slate-500">:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 pl-4 sm:pl-0">
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
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-4 sm:pl-5">
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
