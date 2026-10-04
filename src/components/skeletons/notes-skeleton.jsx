import { Skeleton } from "../ui/skeleton";

export default function NotesSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2 mb-2.5">
      <Skeleton className="h-7 w-full shrink-0" />
      <Skeleton className="h-7 w-1/2" />
    </div>
  );
}
