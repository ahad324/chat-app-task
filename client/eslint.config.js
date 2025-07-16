import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";


export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ...js.configs.recommended,
    languageOptions: {
      parser: tseslint.parser, // Specify TypeScript parser
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX
        },
        ecmaVersion: "latest", // Use latest ECMAScript version
        sourceType: "module", // Use module source type
      },
      globals: {
        ...globals.browser,
        importMeta: true,
      }
    }
  },
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    // Configuration for React settings
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  // Add React Hooks rules
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
];