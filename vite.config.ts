import { defineConfig } from "vite";
//import react from "@vitejs/plugin-react";

const lib_name = "webengine-react";

export default defineConfig({
  //plugins: [react()],
  build: {
    rollupOptions: {
      external: ["@eva-ics/webengine", "react", "react-dom"]
    },
    lib: {
      entry: "./src/lib.ts",
      name: lib_name,
      fileName: (format) => `${lib_name}.${format}.js`
    }
  }
});
