import {resolve} from "path";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { config } from "dotenv";
import type { Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

config({ path: resolve(__dirname, "../.env") });

// https://vite.dev/config/
export default defineConfig({
    envDir: resolve(__dirname, '../'),
    plugins: [
        wasm(),
        topLevelAwait(),
        react(),
        {
            name: 'http-redirect',
            configureServer(server) {
              server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
                const url = req.url;
                const host = req.headers.host;
                const protocol = req.headers['x-forwarded-proto'] || 'http';

                if (url && host && protocol !== 'https') {
                  res.writeHead(301, {
                    Location: `https://${host}${url}`
                  });
                  res.end();
                } else {
                  next();
                }
              });
            }
        }
    ],
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
                target: `${process.env.VITE_API_URL || `http://localhost:3000`}`,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
        host: true, // This allows access from any IP
        port: 443,
        https: {
            key: '/etc/letsencrypt/live/jent.ai/privkey.pem',
            cert: '/etc/letsencrypt/live/jent.ai/fullchain.pem',
        },
        strictPort: true,
        watch: {
        usePolling: true
        },
        hmr: {
        clientPort: 443
        },
    },
});
