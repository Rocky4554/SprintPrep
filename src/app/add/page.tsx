"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import type { Language, MasterTopic } from "@/types";
import { LANGUAGES } from "@/lib/languages";

export default function AddCodeForm() {
  const router = useRouter();

  const [masterTopics, setMasterTopics] = useState<MasterTopic[]>([]);
  const [masterTopicId, setMasterTopicId] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Language>("cpp");
  const [code, setCode] = useState("");
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newMasterName, setNewMasterName] = useState("");
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState("");
  const [masterSuccess, setMasterSuccess] = useState("");

  async function loadMasterTopics() {
    const response = await fetch("/api/master-topics");
    if (!response.ok) return;
    const data = (await response.json()) as MasterTopic[];
    setMasterTopics(data);
    if (data.length > 0 && !masterTopicId) {
      setMasterTopicId(data[0].id);
    }
  }

  useEffect(() => {
    loadMasterTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddMaster(event: React.FormEvent) {
    event.preventDefault();
    setMasterLoading(true);
    setMasterError("");
    setMasterSuccess("");

    try {
      const response = await fetch("/api/master-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMasterName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save");

      setMasterSuccess(`"${newMasterName}" added!`);
      const createdId = data.id as string;
      setNewMasterName("");
      await loadMasterTopics();
      setMasterTopicId(createdId);

      setTimeout(() => {
        router.push(`/topics/${createdId}`);
      }, 600);
    } catch (err) {
      setMasterError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setMasterLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!code.trim() && !notesFile) {
      setError("Add solution code or attach a notes file (PDF, Word, or text).");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("masterTopicId", masterTopicId);
      formData.append("name", name);
      if (code.trim()) {
        formData.append("language", language);
        formData.append("code", code);
      }
      if (notesFile) {
        formData.append("file", notesFile);
      }

      const response = await fetch("/api/topics", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save");

      setSuccess("Saved successfully!");
      setName("");
      setCode("");
      setNotesFile(null);

      setTimeout(() => {
        router.push(`/topics/${masterTopicId}`);
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setNotesFile(null);
      return;
    }

    const allowed = [".pdf", ".doc", ".docx", ".txt"];
    const lower = file.name.toLowerCase();
    const valid = allowed.some((ext) => lower.endsWith(ext));

    if (!valid) {
      setError("Only PDF, Word (.doc/.docx), and text files are allowed.");
      event.target.value = "";
      setNotesFile(null);
      return;
    }

    setError("");
    setNotesFile(file);
  }

  return (
    <div className="study-bg min-h-screen">
      <Header active="add" />

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Add Master Topic</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create categories like Array, Stack, String — then add topics inside each one.
          </p>

          <form onSubmit={handleAddMaster} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="master-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Master Topic Name
              </label>
              <input
                id="master-name"
                type="text"
                required
                value={newMasterName}
                onChange={(event) => setNewMasterName(event.target.value)}
                placeholder="e.g. Array, Stack, Linked List"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {masterError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {masterError}
              </div>
            )}
            {masterSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {masterSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={masterLoading}
              className="rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-60"
            >
              {masterLoading ? "Adding..." : "Add Master Topic"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Add New Code</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pick a master topic, add the problem name, paste code, and/or attach handwritten notes.
          </p>

          {masterTopics.length === 0 ? (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Add a master topic first (e.g. Array), then you can add code topics under it.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="master-topic"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Master Topic
                </label>
                <select
                  id="master-topic"
                  required
                  value={masterTopicId}
                  onChange={(event) => setMasterTopicId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {masterTopics.map((master) => (
                    <option key={master.id} value={master.id}>
                      {master.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Topic Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Sum of array elements"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Use the same name to add another language for an existing topic.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Language
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id)}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                        language === lang.id
                          ? `${lang.color} ring-2 ring-offset-2 ring-slate-400`
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Solution Code
                </label>
                <textarea
                  id="code"
                  rows={14}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Paste your code solution here... (optional if you attach notes)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 font-mono text-sm leading-relaxed text-emerald-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="notes-file"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Handwritten Notes (optional)
                </label>
                <input
                  id="notes-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Attach PDF, Word (.doc/.docx), or text files from your PC.
                </p>
                {notesFile && (
                  <p className="mt-2 text-sm text-emerald-700">
                    Selected: {notesFile.name}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
