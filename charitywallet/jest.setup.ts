import "@testing-library/jest-dom";

// Mock lucide-react icons to avoid ESM import issues in tests
jest.mock("lucide-react", () => ({
  Check: () => null,
  Loader2: () => null,
  CheckCircle: () => null,
}));
