// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

import pluginImport from "eslint-plugin-import";
import pluginPromise from "eslint-plugin-promise";
import pluginN from "eslint-plugin-n";
import pluginPrettier from "eslint-plugin-prettier";

export default defineConfig([
  // Bỏ qua thư mục build
  { ignores: ["eslint.config.mjs", "node_modules", "dist", "build", "coverage", "**/*.min.js"] },

  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.commonjs },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      import: pluginImport,
      promise: pluginPromise,
      n: pluginN,
      prettier: pluginPrettier,
    },
    // Chỉ dùng recommended của @eslint/js; các plugin set rule thủ công (tránh lỗi "plugin:xxx not found")
    extends: [js.configs.recommended],
    rules: {
      /* --- Cơ bản --- */
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      eqeqeq: "warn",
      curly: "warn",
      // "no-console": "warn",
      "prefer-const": "warn",
      "no-var": "error",

      /* --- Import hygiene --- */
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "ignore",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "warn",
      "import/newline-after-import": "warn",

      /* --- Node.js --- */
      "n/no-missing-require": "error",
      "n/no-extraneous-require": "error",
      "n/no-deprecated-api": "warn",

      /* --- Promise --- */
      "promise/no-return-wrap": "warn",
      "promise/no-nesting": "off",
      "promise/always-return": "off",

      /* --- Prettier --- */
      "prettier/prettier": "warn",
    },
  },
]);
