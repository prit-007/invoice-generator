import React from 'react';

const Skeleton = ({ className = "", width = "100%", height = "20px", ...props }) => (
  <div 
    className={`animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] rounded ${className}`}
    style={{ width, height }}
    {...props}
  />
);

const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white rounded-xl p-6 border border-neutral-200 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton width="60%" height="14px" className="mb-2" />
        <Skeleton width="40%" height="24px" className="mb-3" />
        <Skeleton width="80%" height="12px" />
      </div>
      <Skeleton width="48px" height="48px" className="rounded-xl" />
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
    <div className="p-4 border-b border-neutral-200">
      <div className="flex justify-between">
        <Skeleton width="120px" height="20px" />
        <Skeleton width="80px" height="32px" className="rounded-lg" />
      </div>
    </div>
    <div className="p-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-b-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              width={colIndex === 0 ? "25%" : colIndex === columns - 1 ? "15%" : "20%"} 
              height="16px" 
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const SkeletonChart = ({ height = "200px" }) => (
  <div className="bg-white rounded-xl p-6 border border-neutral-200">
    <Skeleton width="150px" height="20px" className="mb-4" />
    <Skeleton width="100%" height={height} className="rounded-lg" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <Skeleton width="200px" height="32px" className="mb-2" />
        <Skeleton width="150px" height="16px" />
      </div>
      <Skeleton width="120px" height="40px" className="rounded-lg" />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
    
    {/* Charts and Recent Activity */}
    <div className="grid lg:grid-cols-2 gap-6">
      <SkeletonChart />
      <SkeletonTable rows={5} columns={3} />
    </div>
  </div>
);

export default Skeleton;
export { SkeletonCard, SkeletonTable, SkeletonChart, DashboardSkeleton };
