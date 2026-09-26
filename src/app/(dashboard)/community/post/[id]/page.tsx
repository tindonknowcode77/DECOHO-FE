import CommunityPostDetail from "@/src/features/community/components/CommunityPostDetail";

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityPostDetail id={id} />;
}
