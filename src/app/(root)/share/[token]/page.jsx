import { fetchSharedNoteByToken } from "@/app/actions/notes";
import EditorWrapper from "@/components/EditorWrapper";

export default async function SharedTokenPage({ params }) {
  const { token } = await params;
  const { success, message, data } = await fetchSharedNoteByToken(token);
  if (!success) return <div>{message}</div>;

  return (
    <EditorWrapper sharedCopy={data} />
  );
}
