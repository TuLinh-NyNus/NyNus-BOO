
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
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  }
];

export default eslintConfig;
