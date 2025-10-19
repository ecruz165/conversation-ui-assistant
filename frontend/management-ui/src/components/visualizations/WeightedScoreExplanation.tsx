import { Info as InfoIcon } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Divider, Typography } from "@mui/material";

interface WeightedScoreExplanationProps {
  modalityScores: Array<{
    modality: string;
    score: number;
    contributionWeight: number;
  }>;
  finalScore: number;
}

export function WeightedScoreExplanation({
  modalityScores,
  finalScore,
}: WeightedScoreExplanationProps) {
  const calculateWeightedContribution = (score: number, weight: number) => score * weight;

  return (
    <Card variant="outlined" sx={{ backgroundColor: "#f9fafb" }}>
      <CardContent>
        <Box className="flex items-center gap-2 mb-3">
          <InfoIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" className="font-semibold">
            How the Final Score is Calculated
          </Typography>
        </Box>

        <Box className="space-y-3">
          {/* Individual Contributions */}
          {modalityScores.map((modalityScore, idx) => {
            const contribution = calculateWeightedContribution(
              modalityScore.score,
              modalityScore.contributionWeight
            );
            const contributionPercentage = Math.round(contribution * 100);

            return (
              <Box key={idx}>
                <Box className="flex justify-between items-center mb-1">
                  <Box className="flex items-center gap-2">
                    <Typography variant="caption" className="font-medium capitalize">
                      {modalityScore.modality}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      ({Math.round(modalityScore.score * 100)}% ×{" "}
                      {Math.round(modalityScore.contributionWeight * 100)}%)
                    </Typography>
                  </Box>
                  <Chip
                    label={`+${contributionPercentage}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
                <Typography variant="caption" className="text-gray-600 block">
                  Score: {Math.round(modalityScore.score * 100)}% × Weight:{" "}
                  {Math.round(modalityScore.contributionWeight * 100)}% = Contributes{" "}
                  {contributionPercentage}% to final score
                </Typography>
              </Box>
            );
          })}

          <Divider sx={{ my: 2 }} />

          {/* Final Score */}
          <Box className="bg-primary-50 p-3 rounded">
            <Box className="flex justify-between items-center">
              <Typography variant="subtitle2" className="font-semibold">
                Final Weighted Score
              </Typography>
              <Typography variant="h6" className="font-bold text-primary-700">
                {Math.round(finalScore * 100)}%
              </Typography>
            </Box>
            <Typography variant="caption" className="text-gray-600 mt-1 block">
              Sum of all weighted contributions
            </Typography>
          </Box>

          {/* Explanation */}
          <Typography variant="caption" className="text-gray-500 block">
            Each modality's score is multiplied by its weight. The final score is the sum of these
            weighted contributions, giving more influence to modalities with higher weights.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
