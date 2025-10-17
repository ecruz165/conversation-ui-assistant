import { createTheme } from "@mui/material/styles";

// Capital Group / American Funds brand theme with Nunito Sans
export const theme = createTheme({
  typography: {
    fontFamily: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
    // Scale based on design guide
    h1: {
      fontSize: "3rem", // 48px
      lineHeight: 1.1,
      fontWeight: 700,
    },
    h2: {
      fontSize: "2.5rem", // 40px
      lineHeight: 1.2,
      fontWeight: 700,
    },
    h3: {
      fontSize: "2rem", // 32px
      lineHeight: 1.2,
      fontWeight: 700,
    },
    h4: {
      fontSize: "1.5rem", // 24px
      lineHeight: 1.3,
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem", // 20px
      lineHeight: 1.4,
      fontWeight: 600,
    },
    h6: {
      fontSize: "1.125rem", // 18px
      lineHeight: 1.4,
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem", // 16px
      lineHeight: 1.7,
    },
    body2: {
      fontSize: "0.875rem", // 14px
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem", // 12px
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none", // Don't force uppercase on buttons
      fontWeight: 600,
    },
  },
  palette: {
    primary: {
      light: "#33A7CF",
      main: "#0099D8",
      dark: "#006BA6",
      contrastText: "#fff",
    },
    secondary: {
      main: "#0067b0",
    },
    error: {
      main: "#a60b0b",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#3b82f6",
    },
    success: {
      main: "#0ba60d",
    },
    background: {
      default: "#f9fafb",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
  },
  shape: {
    borderRadius: 8, // 0.5rem from design guide
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: 600,
          transition: "all 0.2s ease-in-out",
        },
        sizeLarge: {
          padding: "16px 32px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          },
        },
        containedPrimary: {
          backgroundColor: "#007AB0", // primary.600
          "&:hover": {
            backgroundColor: "#006BA6", // primary.700
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
        outlinedPrimary: {
          borderColor: "#007AB0", // primary.600
          color: "#007AB0",
          "&:hover": {
            borderColor: "#006BA6", // primary.700
            backgroundColor: "rgba(0,97,176,0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});
