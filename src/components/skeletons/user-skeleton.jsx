import { Skeleton } from "../ui/skeleton";

export default function UserSkeleton() {
  return (
    <div className="flex items-center gap-2 h-10 p-2 mb-2.5">
      <Skeleton className="size-7 shrink-0 rounded-full" />
      <Skeleton className="h-5 w-full" />
    </div>
  );
}
