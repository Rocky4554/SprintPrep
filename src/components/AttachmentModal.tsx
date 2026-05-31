"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Attachment } from "@/types";

interface AttachmentModalProps {
  topicName: string;
  attachment: Attachment;
  onClose: () => void;
}

function isTextFile(attachment: Attachment): boolean {
  return (
    attachment.mimeType === "text/plain" ||
    attachment.originalName.toLowerCase().endsWith(".txt")
  );
}

export default function AttachmentModal({
  topicName,
  attachment,
  onClose,
}: AttachmentModalProps) {
  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(isTextFile(attachment));
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileUrl = `/api/attachments/${attachment.fileId}`;
  const showText = isTextFile(attachment);

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

  useEffect(() => {
    if (!showText) return;

    async function loadText() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to load file");
        setTextContent(await response.text());
      } catch {
        setError("Could not load this file.");
      } finally {
        setLoading(false);
      }
    }

    loadText();
  }, [fileUrl, showText]);

  async function handleCopy() {
    if (!textContent) return;
    try {
      await navigator.clipboard.writeText(textContent);
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
              Notes:{" "}
              <span className="font-medium text-slate-700">{attachment.originalName}</span>
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
            {showText && (
              <div className="flex shrink-0 items-center justify-end gap-2 px-5 py-3 sm:px-6">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!textContent}
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            <div className="no-scrollbar min-h-0 flex-1 overflow-auto">
              {loading && (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-emerald-400" />
                </div>
              )}

              {error && (
                <p className="p-6 text-center text-sm text-red-400">{error}</p>
              )}

              {showText && !loading && !error && (
                <pre className="whitespace-pre-wrap px-5 pb-5 font-mono text-sm leading-relaxed text-emerald-100 sm:px-6 sm:pb-6 sm:text-[15px]">
                  {textContent}
                </pre>
              )}

              {!showText && !loading && !error && (
                <iframe
                  src={fileUrl}
                  title={attachment.originalName}
                  className="h-full min-h-[70vh] w-full border-0 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
