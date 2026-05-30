import Link from "next/link";
import Header from "@/components/Header";
import { getMasterTopics } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const masterTopics = await getMasterTopics();

  return (
    <div className="study-bg min-h-screen">
      <Header active="home" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900">Welcome to Sprintprep</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-500">
            Select a master topic from the <strong>All Topics</strong> dropdown in the
            header to open its page and view all your problems and solutions.
          </p>

          {masterTopics.length > 0 ? (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {masterTopics.map((master) => (
                <Link
                  key={master.id}
                  href={`/topics/${master.id}`}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {master.name} ({master.topics.length})
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href="/add"
              className="mt-8 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              + Add your first master topic
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
