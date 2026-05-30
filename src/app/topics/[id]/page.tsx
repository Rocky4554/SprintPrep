import Header from "@/components/Header";
import MasterTopicProblems from "@/components/MasterTopicProblems";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="study-bg min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <MasterTopicProblems masterTopicId={id} />
      </main>
    </div>
  );
}
