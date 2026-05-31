"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMasterTopics } from "@/hooks/useTopics";

interface HeaderProps {
  active?: "home" | "add";
}

export default function Header({ active = "home" }: HeaderProps) {
  const pathname = usePathname();
  const { data: masterTopics = [] } = useMasterTopics();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTopicId = pathname.startsWith("/topics/")
    ? pathname.split("/topics/")[1]
    : null;

  const currentTopic = masterTopics.find((m) => m.id === currentTopicId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:text-lg">
            S
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {currentTopic ? currentTopic.name : "Sprintprep"}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {currentTopic
                ? `${currentTopic.topics.length} problems`
                : "Your coding study notes"}
            </p>
          </div>
        </Link>

        {/* Desktop nav — mobile uses bottom bar */}
        <nav className="hidden items-center gap-2 md:flex">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                currentTopicId || active === "home"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {currentTopic ? currentTopic.name : "All Topics"}
              <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {masterTopics.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">
                    No topics yet. Add one!
                  </p>
                ) : (
                  masterTopics.map((master) => (
                    <Link
                      key={master.id}
                      href={`/topics/${master.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-[44px] items-center justify-between px-4 py-2.5 text-sm transition hover:bg-emerald-50 ${
                        master.id === currentTopicId
                          ? "bg-emerald-50 font-semibold text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{master.name}</span>
                      <span className="text-xs text-slate-400">
                        {master.topics.length}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            href="/add"
            className={`flex min-h-[44px] items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active === "add"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            + Add
          </Link>
        </nav>
      </div>
    </header>
  );
}
