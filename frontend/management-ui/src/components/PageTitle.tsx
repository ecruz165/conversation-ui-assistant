import { Typography } from "@mui/material";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <>
      <Typography variant="h4" className="font-bold text-white">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" className="mt-2 text-white/90">
          {subtitle}
        </Typography>
      )}
    </>
  );
}
