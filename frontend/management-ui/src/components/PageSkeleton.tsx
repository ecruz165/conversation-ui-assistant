import { Box, Skeleton } from "@mui/material";

export function PageSkeleton() {
  return (
    <Box className="px-page-mobile md:px-page lg:px-8 py-section-mobile md:py-12">
      <div className="max-w-7xl mx-auto">
        <Skeleton variant="text" width="30%" height={40} className="mb-6" />
        <div className="bg-white rounded-lg shadow p-card">
          <Skeleton variant="rectangular" height={200} className="mb-4" />
          <Skeleton variant="text" width="80%" className="mb-2" />
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    </Box>
  );
}
