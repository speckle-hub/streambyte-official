import { Skeleton } from './Skeleton';

export function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="aspect-[2/3] w-full relative">
        <Skeleton className="absolute inset-0 rounded-2xl" />
      </div>
      <Skeleton className="h-4 w-3/4 mt-1 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  );
}
