/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        // Override bundler module resolution which Jest doesn't support
        moduleResolution: "node",
        // Keep the new JSX transform (no need to import React)
        jsx: "react-jsx",
      },
    }],
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  collectCoverage: false,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov"],
};
