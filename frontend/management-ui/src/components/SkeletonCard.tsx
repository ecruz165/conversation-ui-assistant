export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-card animate-pulse h-[128px] flex flex-col justify-center items-center text-center">
      <div className="h-[1.375rem] md:h-[1.7rem] bg-gray-200 rounded w-2/3 mb-1"></div>
      <div className="h-[2.4rem] md:h-[2.8rem] bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
