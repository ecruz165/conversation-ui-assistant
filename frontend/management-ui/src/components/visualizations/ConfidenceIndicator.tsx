import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Box, LinearProgress, Tooltip, Typography } from "@mui/material";

interface ConfidenceIndicatorProps {
  confidence: number; // 0-1
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  showPercentage?: boolean;
}

export function ConfidenceIndicator({
  confidence,
  size = "medium",
  showLabel = true,
  showPercentage = true,
}: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);

  // Determine confidence level and styling
  const getConfidenceLevel = () => {
    if (confidence >= 0.8) return { level: "High", color: "#4caf50", icon: CheckCircleIcon };
    if (confidence >= 0.5) return { level: "Medium", color: "#ff9800", icon: WarningIcon };
    return { level: "Low", color: "#f44336", icon: ErrorIcon };
  };

  const { level, color, icon: Icon } = getConfidenceLevel();

  // Size configurations
  const sizeConfig = {
    small: { height: 4, iconSize: 16, fontSize: "0.75rem" },
    medium: { height: 6, iconSize: 20, fontSize: "0.875rem" },
    large: { height: 8, iconSize: 24, fontSize: "1rem" },
  };

  const config = sizeConfig[size];

  return (
    <Box>
      {showLabel && (
        <Box className="flex items-center justify-between mb-1">
          <Box className="flex items-center gap-1">
            <Typography
              variant="caption"
              sx={{ fontSize: config.fontSize }}
              className="font-medium"
            >
              Confidence
            </Typography>
            <Tooltip title={`${level} confidence (${percentage}%)`}>
              <Icon sx={{ fontSize: config.iconSize, color }} />
            </Tooltip>
          </Box>
          {showPercentage && (
            <Typography
              variant="caption"
              sx={{ fontSize: config.fontSize, fontWeight: "bold", color }}
            >
              {percentage}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: config.height,
          borderRadius: config.height / 2,
          backgroundColor: "#e0e0e0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            borderRadius: config.height / 2,
          },
        }}
      />
    </Box>
  );
}
