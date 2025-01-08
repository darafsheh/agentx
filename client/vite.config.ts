import {resolve} from "path";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { config } from "dotenv";
import fs from 'fs';
import * as http from 'node:http';

config({ path: resolve(__dirname, "../.env") });

// https://vite.dev/config/
export default defineConfig({
    envDir: resolve(__dirname, '../'),
    plugins: [
        wasm(),
        topLevelAwait(),
        react(),
        {
            name: 'redirect-server',
            // Changed to use configurePreviewServer instead
            configurePreviewServer(server) {
                server.httpServer?.once('listening', () => {
                    const redirectServer = http.createServer((req, res) => {
                        const host = req.headers.host?.split(':')[0] || 'localhost';
                        res.writeHead(301, { Location: `https://${host}${req.url}` });
                        res.end();
                    });

                    redirectServer.listen(80);
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
        // https: process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH ? {
        //     key: fs.readFileSync(process.env.SSL_KEY_PATH),
        //     cert: fs.readFileSync(process.env.SSL_CERT_PATH),
        // } : undefined,
        https: (() => {
            try {
                return process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH ? {
                    key: fs.readFileSync(process.env.SSL_KEY_PATH),
                    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
                } : undefined;
            } catch (e: any) {
                console.warn('SSL certificates error:', e.message);
                console.warn('SSL certificates not found, falling back to HTTP');
                return undefined;
            }
        })(),
        strictPort: true,
        watch: {
        usePolling: true
        },
        hmr: {
        clientPort: 443
        }
    },
});
