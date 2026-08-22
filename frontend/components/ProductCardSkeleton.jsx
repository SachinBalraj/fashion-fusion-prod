export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-xl bg-muted mb-3" />
      <div className="px-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/4 rounded bg-muted" />
        <div className="h-8 w-full rounded-lg bg-muted mt-3" />
      </div>
    </div>
  );
}
