import Link from "next/link";
import Header from "@/components/Header";
import { getMasterTopics } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const masterTopics = await getMasterTopics();

  return (
    <div className="study-bg page-shell min-h-screen">
      <Header active="home" />

      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm sm:p-12">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Welcome to Sprintprep</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 sm:text-base">
            Tap <strong>Topics</strong> in the bottom bar to open a master topic and revise your
            solutions.
          </p>

          {masterTopics.length > 0 ? (
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              {masterTopics.map((master) => (
                <Link
                  key={master.id}
                  href={`/topics/${master.id}`}
                  className="min-h-[48px] rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition active:bg-emerald-700 sm:py-2.5"
                >
                  {master.name} ({master.topics.length})
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href="/add"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition active:bg-emerald-700 sm:mt-8"
            >
              + Add your first master topic
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
