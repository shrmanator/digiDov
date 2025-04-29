// jest.config.js
const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('ts-jest').JestConfigWithTsJest} */
const customConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^lucide-react$": "<rootDir>/__mocks__/lucide-react.ts",
  },
  transformIgnorePatterns: ["node_modules/(?!(lucide-react)/)"],
};

module.exports = createJestConfig(customConfig);
