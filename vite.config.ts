import { defineConfig } from "vite";
//import react from "@vitejs/plugin-react";

const lib_name = "webengine-react";

export default defineConfig({
  //plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      external: [
        "@eva-ics/webengine",
        "@eva-ics/webengine-multimedia",
        "react",
        "react-dom",
        "react-hot-toast",
        "react-qr-code",
        "react-chartjs-2",
        "chart.js",
        "bmat",
        "bmat/dom",
        "bmat/numbers",
        "bmat/tools",
        "bmat/dashtable"
      ]
    },
    lib: {
      entry: "./src/lib.mts",
      name: lib_name,
      fileName: (format) => `${lib_name}.${format}.js`
    }
  }
});
