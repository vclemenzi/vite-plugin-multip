import type { ViteDevServer } from "vite";
import fs from "fs";
import mime from "mime";
import { hotupdate } from "./hot";

// This feature is in beta, so it may not work as expected
// I hope I'll find a better way to do this
// As today, dev server do the same thing as preview server

export const createServer = (server: ViteDevServer) => {
  hotupdate();

  server.middlewares.use((req, res) => {
    if (!req.url) return;

    res.setHeader("Cache-Control", "public, max-age=31536000");

    if (!/\.[a-z]+$/.test(req.url)) {
      return res.end(fs.readFileSync(`dist${req.url}/index.html`));
    }

    const ext = req.url.split(".").pop() || "";

    res.setHeader("Content-Type", mime.getType(ext) || "text/plain");
    return res.end(fs.readFileSync(`dist${req.url}`));
  });
};
