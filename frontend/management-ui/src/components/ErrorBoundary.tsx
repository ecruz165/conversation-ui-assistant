import { Error as ErrorIcon } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <Paper elevation={3} className="p-8 max-w-md w-full text-center">
            <ErrorIcon className="text-error-600 mb-4" sx={{ fontSize: 64 }} />
            <Typography variant="h5" className="font-bold text-gray-900 mb-2">
              Something went wrong
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page or return to the
              home page.
            </Typography>
            {this.state.error && (
              <Typography
                variant="body2"
                className="text-gray-500 mb-6 font-mono text-xs bg-gray-100 p-3 rounded"
              >
                {this.state.error.message}
              </Typography>
            )}
            <Box className="flex gap-3 justify-center">
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button variant="contained" onClick={this.handleReset}>
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
