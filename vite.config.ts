/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Web3Auth's dependency graph relies on Node built-ins (buffer/stream/crypto)
    // and process/global. Without these polyfills Vite's dep optimizer produces a
    // broken @web3auth/modal bundle (missing named exports at runtime).
    nodePolyfills({
      include: ["buffer", "stream", "crypto"],
      globals: {
        Buffer: true,
        global: true,
      },
      overrides: {
        process: path.resolve(__dirname, "node_modules/process/browser.js"),
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      process: path.resolve(__dirname, "node_modules/process/browser.js"),
    },
  },
  build: {
    target: "esnext",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
