import FilteredNotes from "../filtered-notes";
import PinnedNotes from "../pinned-notes";

export default function NotesWrapper() {

  return (
    <>
      <PinnedNotes />
      <FilteredNotes />
    </>
  );
}
