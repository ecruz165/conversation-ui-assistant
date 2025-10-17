import { Box, LinearProgress, Typography } from "@mui/material";
import { memo } from "react";

// Helper function for score color
function getScoreColor(score: number): string {
  if (score >= 0.9) return "#4caf50"; // Green
  if (score >= 0.7) return "#ff9800"; // Amber
  if (score >= 0.5) return "#ff5722"; // Orange
  return "#9e9e9e"; // Gray
}

interface ScoreData {
  label: string;
  score: number;
  maxScore?: number;
}

interface ScoreBreakdownBarsProps {
  scores: ScoreData[];
  showPercentages?: boolean;
  colorful?: boolean; // Use score-based colors
}

export const ScoreBreakdownBars = memo(function ScoreBreakdownBars({
  scores,
  showPercentages = true,
  colorful = true,
}: ScoreBreakdownBarsProps) {
  return (
    <Box className="space-y-3">
      {scores.map((scoreData, idx) => {
        const maxScore = scoreData.maxScore || 1;
        const percentage = Math.round((scoreData.score / maxScore) * 100);
        const normalizedScore = scoreData.score / maxScore; // Normalize to 0-1
        const barColor = colorful ? getScoreColor(normalizedScore) : "#1976d2";

        return (
          <Box key={idx}>
            <Box className="flex justify-between items-center mb-1">
              <Typography variant="body2" className="font-medium">
                {scoreData.label}
              </Typography>
              {showPercentages && (
                <Typography variant="body2" className="font-bold" sx={{ color: barColor }}>
                  {percentage}%
                </Typography>
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: barColor,
                  borderRadius: 5,
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
});
