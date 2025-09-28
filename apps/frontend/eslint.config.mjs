
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Generated files
      "src/generated/**/*",
      "**/*.pb.js",
      "**/*.pb.d.ts",
      // Node modules
      "**/node_modules/**",
      // Build output
      ".next/**",
      "out/**",
      "dist/**",
      // Coverage
      "coverage/**",
      ".nyc_output/**",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // Temporarily disable some rules for cleanup
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "import/no-anonymous-default-export": "warn"
    }
  },
  // Turn off strict rules for generated outputs anyway
  {
    files: ["src/generated/**/*.{js,ts,d.ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "import/no-anonymous-default-export": "off",
    }
  },
  // Allow ambient declarations to use any where necessary
  {
    files: ["src/types/**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];

export default eslintConfig;
