import js from "@eslint/js";
import n from "eslint-plugin-n";
import globals from "globals";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    plugins: {
      js,
      n,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...n.configs["flat/recommended"].rules,
      "prettier/prettier": "warn",
      "no-console": "off", // autorise console.log (utile pour Express)
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
    extends: ["js/recommended"]
  },
  {
    // Applique Prettier en dernier pour écraser les conflits
    files: ["**/*.{js,mjs,cjs}"],
    rules: {
      ...prettierConfig.rules,
    },
  },
]);
