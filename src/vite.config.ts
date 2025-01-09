import { defineConfig } from "vite";
import { htmlComponentsPlugin } from "./plugins/html-components";


export default defineConfig({
    root: "./src",
    build: {
      outDir: "./dist",
      emptyOutDir: true,
    },
    plugins: [htmlComponentsPlugin()],
  });