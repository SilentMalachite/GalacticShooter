// ESLint flat config for TypeScript + React (ESLint v9)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: [
      "dist/**", "electron-dist/**", "node_modules/**", "build/**",
      ".eslintrc.cjs"
    ] },
  {
    files: ["**/*.{ts,tsx}", "client/**/*.tsx", "server/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "@typescript-eslint": tseslint.plugin, react, "react-hooks": reactHooks },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/prefer-as-const": "off",
    },
    settings: { react: { version: "detect" } },
  },
  // JS (Node, ESM)
  {
    files: ["electron-main.js", "electron-simple.js", "electron-setup.js", "quick-start.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-duplicate-imports": "error",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
      ],
    },
  },
  // Browser JS (legacy script)
  {
    files: ["game.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.browser },
    },
    rules: {
      "no-case-declarations": "error",
      // 未使用はエラー、先頭が _ の変数は許可
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
      ],
      // fallthrough は禁止（必要であれば将来コメントで許容）
      "no-fallthrough": "error",
      "no-duplicate-imports": "error",
    },
  },
  // JS (Node, CommonJS)
  {
    files: ["**/*.cjs"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-duplicate-imports": "error",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
      ],
    },
  },
  // Config files (Tailwind): allow require()
  {
    files: ["tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Client app: consoleの使用を段階的に警告
  {
    files: ["client/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
