const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-black/10 dark:bg-white/10 ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-[3/4] w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-5 w-1/3" />
  </div>
);

export const PageSkeleton = () => (
  <div className="section-pad py-16 page-wrap space-y-8">
    <Skeleton className="h-10 w-64" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;
