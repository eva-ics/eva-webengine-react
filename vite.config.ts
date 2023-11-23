import { defineConfig } from "vite";
//import react from "@vitejs/plugin-react";

const lib_name = "webengine-react";

export default defineConfig({
  //plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        "@eva-ics/webengine",
        "react",
        "react-dom",
        "react-hot-toast",
        "react-qrious",
        "react-chartjs-2",
        "bmat",
        "bmat/dom",
        "bmat/tools"
      ]
    },
    lib: {
      entry: "./src/lib.mts",
      name: lib_name,
      fileName: (format) => `${lib_name}.${format}.js`
    }
  }
});
