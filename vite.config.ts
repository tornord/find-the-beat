import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "setup",
      config: () => ({
        test: {
          setupFiles: ["./setupVitest.ts"],
        },
      }),
    },
  ],
  resolve: {
    alias: {
      // "@common": resolve("../common/src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    include: ["./src/**/*.test.[jt]s"],
    exclude: [...configDefaults.exclude],
    globals: true,
    testTimeout: 3000,
    reporters: ["default"],
    passWithNoTests: true,
    logHeapUsage: true,
  },
});
