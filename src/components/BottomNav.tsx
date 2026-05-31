"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Home, Plus, X } from "lucide-react";
import { useMasterTopics } from "@/hooks/useTopics";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: masterTopics = [] } = useMasterTopics();
  const [topicsOpen, setTopicsOpen] = useState(false);

  const currentTopicId = pathname.startsWith("/topics/")
    ? pathname.split("/topics/")[1]
    : null;

  useEffect(() => {
    setTopicsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!topicsOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [topicsOpen]);

  const isHome = pathname === "/";
  const isAdd = pathname === "/add";
  const isTopic = Boolean(currentTopicId);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-lg md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
          <Link
            href="/"
            className={`flex min-h-[52px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-xs font-semibold transition active:scale-95 ${
              isHome ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            <Home className={`h-5 w-5 ${isHome ? "stroke-[2.5]" : ""}`} />
            Home
          </Link>

          <button
            type="button"
            onClick={() => setTopicsOpen(true)}
            className={`flex min-h-[52px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-xs font-semibold transition active:scale-95 ${
              isTopic ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            <BookOpen className={`h-5 w-5 ${isTopic ? "stroke-[2.5]" : ""}`} />
            Topics
          </button>

          <Link
            href="/add"
            className={`flex min-h-[52px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-xs font-semibold transition active:scale-95 ${
              isAdd ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            <Plus className={`h-5 w-5 ${isAdd ? "stroke-[2.5]" : ""}`} />
            Add
          </Link>
        </div>
      </nav>

      {topicsOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setTopicsOpen(false)}
            aria-label="Close topics"
          />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[75dvh] overflow-hidden rounded-t-2xl bg-white shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-bold text-slate-900">All Topics</h2>
              <button
                type="button"
                onClick={() => setTopicsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="no-scrollbar max-h-[calc(75dvh-56px)] overflow-y-auto">
              {masterTopics.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  No topics yet. Tap Add to create one.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 pb-2">
                  {masterTopics.map((master) => (
                    <li key={master.id}>
                      <Link
                        href={`/topics/${master.id}`}
                        onClick={() => setTopicsOpen(false)}
                        className={`flex min-h-[52px] items-center justify-between px-4 py-3 text-sm transition active:bg-emerald-50 ${
                          master.id === currentTopicId
                            ? "bg-emerald-50 font-semibold text-emerald-700"
                            : "text-slate-700"
                        }`}
                      >
                        <span>{master.name}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                          {master.topics.length}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
