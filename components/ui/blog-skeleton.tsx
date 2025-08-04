import { Skeleton } from './skeleton'

export function BlogListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-100 shadow-sm rounded-lg p-3"
        >
          <div className="flex flex-col md:flex-row h-full">
            {/* 图片骨架 */}
            <div className="md:w-1/3">
              <Skeleton className="aspect-video md:aspect-square rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
            </div>

            {/* 内容骨架 */}
            <div className="md:w-2/3 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-16" />
              </div>

              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1 flex-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Skeleton className="h-7 w-7" />
                  <Skeleton className="h-7 w-7" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="border border-gray-100 shadow-sm rounded-lg p-3">
      <div className="flex flex-col md:flex-row h-full">
        {/* 图片骨架 */}
        <div className="md:w-1/3">
          <Skeleton className="aspect-video md:aspect-square rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
        </div>

        {/* 内容骨架 */}
        <div className="md:w-2/3 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-16" />
          </div>

          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1 flex-1" />
          <Skeleton className="h-4 w-2/3 mb-3" />

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
