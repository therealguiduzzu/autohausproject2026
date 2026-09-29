import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Deployment-Ziel über NITRO_PRESET wählbar (Standard: eigener Node-Server,
// z. B. für VPS/Docker/Railway/Render). Beispiele: "vercel", "netlify", "cloudflare-module".
export default defineConfig({
  server: { port: 3000 },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ server: { entry: "server" } }),
    nitro({ preset: process.env.NITRO_PRESET ?? "node-server" }),
    viteReact(),
    tailwindcss(),
  ],
});
