module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  env: {
    node: true,
    browser: true,
    es2022: true,
    jest: true,
  },
  rules: {
    // Warn instead of error on 'any' to ease adoption
    "@typescript-eslint/no-explicit-any": "warn",
    // Allow unused vars that start with underscore
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  },
};
