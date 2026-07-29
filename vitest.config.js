import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/services/**/*.js",
        "src/utils/errors.js",
        "src/utils/validation.js"
      ],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 90,
        lines: 85
      }
    }
  }
});
