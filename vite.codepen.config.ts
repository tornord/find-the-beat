/// <reference types="vitest" />
import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import pkg from "./package.json";

const EXTERNAL_SCRIPTS = [
  { name: "react", globalName: "React", url: "https://unpkg.com/react@VERSION/umd/react.development.js" },
  {
    name: "react-dom",
    globalName: "ReactDOM",
    url: "https://unpkg.com/react-dom@VERSION/umd/react-dom.development.js",
  },
  {
    name: "@emotion/react",
    globalName: "emotionReact",
    url: "https://unpkg.com/@emotion/react@VERSION/dist/emotion-react.umd.min.js",
  },
  {
    name: "@emotion/styled",
    globalName: "emotionStyled",
    url: "https://unpkg.com/@emotion/styled@VERSION/dist/emotion-styled.umd.min.js",
  },
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic",
      // babel: {
      //   plugins: ["formatjs"],
      // },
    }),
    // {
    //   name: "rename",
    //   enforce: "post",
    //   generateBundle(options, bundle) {
    //     // console.log("bundle", options);
    //     // bundle["index-codepen.html"].fileName = "index.html";
    //   },
    // },
    {
      name: "add-script-imports",
      apply: "build",
      transformIndexHtml(html) {
        const rows = html.split("\n").map((d) => [d]) as string[][];
        const titleRows = rows.find((row) => row[0].includes("<title>"));
        if (!titleRows) return html;
        const m = titleRows[0].match(/^([ \t]+)<title>(.*?)<\/title>$/);
        for (const s of EXTERNAL_SCRIPTS) {
          const version = pkg.dependencies[s.name].replace("^", "");
          const url = s.url.replace("VERSION", version);
          titleRows.push(`${m![1]}<script src="${url}"></script>`);
        }
        return rows.flat().join("\n");
      },
    },
  ],
  resolve: {
    alias: {
      // "@common": resolve("../common/src"),
    },
  },
  build: {
    outDir: "dist-codepen",
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      external: EXTERNAL_SCRIPTS.map((d) => d.name),
      output: {
        globals: Object.fromEntries(EXTERNAL_SCRIPTS.map((d) => [d.name, d.globalName])),
        format: "iife",
      },
    },
  },
  test: {
    include: ["./src/**/*.test.[jt]s"],
    exclude: [...configDefaults.exclude],
    globals: true,
    testTimeout: 3000,
    reporters: ["basic"],
    passWithNoTests: true,
    logHeapUsage: true,
    setupFiles: ["./setupVitest.ts"],
  },
});
