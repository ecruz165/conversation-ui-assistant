import { Box, Paper, Typography } from "@mui/material";
import React from "react";

interface RadarDataPoint {
  axis: string;
  value: number; // 0-1
}

interface MultiModalRadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  colorScheme?: string; // Hex color for the chart
}

export function MultiModalRadarChart({
  data,
  size = 300,
  colorScheme = "#1976d2",
}: MultiModalRadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 40; // Leave space for labels
  const levels = 5; // Number of concentric circles

  // Calculate polygon points for the data
  const calculatePoint = (value: number, angleIndex: number, totalPoints: number) => {
    const angle = (Math.PI * 2 * angleIndex) / totalPoints - Math.PI / 2; // Start from top
    const distance = value * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  // Calculate label position
  const calculateLabelPosition = (angleIndex: number, totalPoints: number) => {
    const angle = (Math.PI * 2 * angleIndex) / totalPoints - Math.PI / 2;
    const labelDistance = radius + 20;
    return {
      x: center + labelDistance * Math.cos(angle),
      y: center + labelDistance * Math.sin(angle),
    };
  };

  // Create points string for polygon
  const dataPoints = data
    .map((d, i) => {
      const point = calculatePoint(d.value, i, data.length);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f9fafb" }}>
      <Typography variant="subtitle2" className="font-semibold mb-3 text-center">
        Multi-Modal Score Radar
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circles (levels) */}
          {Array.from({ length: levels }, (_, i) => {
            const levelRadius = ((i + 1) / levels) * radius;
            return (
              <circle
                key={`level-${i}`}
                cx={center}
                cy={center}
                r={levelRadius}
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines */}
          {data.map((d, i) => {
            const endPoint = calculatePoint(1, i, data.length);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#d0d0d0"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={dataPoints}
            fill={colorScheme}
            fillOpacity="0.25"
            stroke={colorScheme}
            strokeWidth="2"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const point = calculatePoint(d.value, i, data.length);
            return (
              <circle
                key={`point-${i}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={colorScheme}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Labels */}
          {data.map((d, i) => {
            const labelPos = calculateLabelPosition(i, data.length);
            const percentage = Math.round(d.value * 100);

            return (
              <g key={`label-${i}`}>
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="#333"
                >
                  {d.axis}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {percentage}%
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
      <Typography variant="caption" className="text-gray-500 text-center block mt-2">
        Each axis represents a different embedding dimension. Larger area indicates better overall
        coverage.
      </Typography>
    </Paper>
  );
}
