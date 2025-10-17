import { TrendingUp as TrendingUpIcon } from "@mui/icons-material";
import { Box, Chip, LinearProgress, Typography } from "@mui/material";
import type { PageMatch } from "~/types";

// Helper function for score color
function getMatchScoreColor(score: number): string {
  if (score >= 0.9) return "#4caf50"; // Green
  if (score >= 0.7) return "#ff9800"; // Amber
  if (score >= 0.5) return "#ff5722"; // Orange
  return "#9e9e9e"; // Gray
}

interface MultiModalScoreBreakdownProps {
  result: PageMatch;
}

export function MultiModalScoreBreakdown({ result }: MultiModalScoreBreakdownProps) {
  if (!result.modalityScores || result.modalityScores.length === 0) {
    return null;
  }

  return (
    <Box className="mt-4">
      <Typography variant="subtitle2" className="font-semibold mb-2 flex items-center gap-1">
        <TrendingUpIcon fontSize="small" />
        Multi-Modal Score Breakdown
      </Typography>
      <Box className="space-y-2">
        {result.modalityScores.map((modalityScore) => {
          const percentage = Math.round(modalityScore.score * 100);
          const contribution = Math.round(modalityScore.contributionWeight * 100);

          return (
            <Box key={modalityScore.modality}>
              <Box className="flex justify-between items-center mb-1">
                <Box className="flex items-center gap-2">
                  <Typography variant="caption" className="font-medium capitalize">
                    {modalityScore.modality}
                  </Typography>
                  <Chip
                    label={`${contribution}% weight`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
                <Typography variant="caption" className="font-bold">
                  {percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getMatchScoreColor(modalityScore.score),
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
