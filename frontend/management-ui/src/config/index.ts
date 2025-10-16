// API Configuration
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  navigationUrl: import.meta.env.VITE_NAVIGATION_API_URL || "http://localhost:8081/api",
};

// Mock configuration from PRD Section 4.3.1
export const mockConfig = {
  enabled: import.meta.env.VITE_MOCK_ENABLED === "true", // Use environment variable to toggle mocks
  delay: Number(import.meta.env.VITE_MOCK_DELAY) || 500, // Simulated network delay in ms
  failureRate: Number(import.meta.env.VITE_MOCK_FAILURE_RATE) || 0, // 0-1, probability of request failure
};

// External Links Configuration
export const externalLinks = {
  documentation: import.meta.env.VITE_DOCUMENTATION_URL || "https://docs.example.com",
};
