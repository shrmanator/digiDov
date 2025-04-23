const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./", // path to your Next.js app
});

const customConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // keep your @/* aliases
  },
};

module.exports = createJestConfig(customConfig);
