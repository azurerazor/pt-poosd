import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    checker({
      // e.g. use TypeScript check
      typescript: { tsconfigPath: "./tsconfig.app.json" },
    }),
  ],
});
