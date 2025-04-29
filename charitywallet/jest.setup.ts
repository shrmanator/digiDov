import "@testing-library/jest-dom";

// Polyfill TextEncoder/TextDecoder for libraries (e.g. thirdweb) that rely on them in node/JSDOM
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from "util";

// Provide polyfills only if missing (JSDOM < 20)
if (typeof global.TextEncoder === "undefined") {
  // @ts-ignore
  global.TextEncoder = NodeTextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  // @ts-ignore
  global.TextDecoder = NodeTextDecoder;
}

// Mock lucide-react icons to avoid ESM import issues in tests
jest.mock("lucide-react", () => ({
  X: () => null,
  Building2Icon: () => null,
  UserCheckIcon: () => null,
  Check: () => null,
  Loader2: () => null,
  CheckCircle: () => null,
}));

// Mock UI dialog primitives
jest.mock("@/components/ui/dialog", () => {
  const React = require("react");
  return {
    Dialog: ({ children }: { children: React.ReactNode }) => children,
    DialogContent: ({ children }: { children: React.ReactNode }) => children,
    DialogOverlay: ({ children }: { children: React.ReactNode }) => children,
    DialogPortal: ({ children }: { children: React.ReactNode }) => children,
    DialogTrigger: ({ children }: { children: React.ReactNode }) => children,
    DialogClose: ({ children }: { children: React.ReactNode }) => children,
    DialogHeader: ({ children }: { children: React.ReactNode }) => children,
    DialogFooter: ({ children }: { children: React.ReactNode }) => children,
    DialogTitle: ({ children }: { children: React.ReactNode }) => children,
    DialogDescription: ({ children }: { children: React.ReactNode }) => children,
  };
});
