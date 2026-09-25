import EditorWrapper from "@/components/EditorWrapper";

export default async function NotePage({ params }) {
  const { id } = await params;
  return (
    <EditorWrapper id={id} />
  );
}
