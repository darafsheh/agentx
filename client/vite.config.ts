import {resolve} from "path";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env") });

// https://vite.dev/config/
export default defineConfig({
    envDir: resolve(__dirname, '../'),
    plugins: [wasm(), topLevelAwait(), react()],
    optimizeDeps: {
        exclude: ["onnxruntime-node", "@anush008/tokenizers"],
    },
    build: {
        commonjsOptions: {
            exclude: ["onnxruntime-node", "@anush008/tokenizers"],
        },
        rollupOptions: {
            external: ["onnxruntime-node", "@anush008/tokenizers"],
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            "/api": {
                target: `${process.env.VITE_API_URL}`,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
