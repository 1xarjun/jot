import EditorWrapper from "@/components/EditorWrapper";

export default async function SharedTokenPage({ params }) {
  const { token } = await params;
  return (
    <EditorWrapper token={token} />
  );
}
