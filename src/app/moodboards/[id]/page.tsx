import MoodboardDetailPage from "@/src/features/moodboards/pages/MoodboardDetailPage";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: RouteProps) {
  return <MoodboardDetailPage params={params} />;
}
