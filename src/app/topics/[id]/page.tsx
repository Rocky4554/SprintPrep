import Header from "@/components/Header";
import MasterTopicProblems from "@/components/MasterTopicProblems";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="study-bg page-shell min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        <MasterTopicProblems masterTopicId={id} />
      </main>
    </div>
  );
}
