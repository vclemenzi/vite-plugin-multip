import type { ViteDevServer } from "vite";
import fs from "fs";
import mime from "mime";
import { hotupdate } from "./hot";
import path from "path";

// This feature is in beta, so it may not work as expected
// I hope I'll find a better way to do this
// As today, dev server do the same thing as preview server

export const createServer = (server: ViteDevServer) => {
  hotupdate();

  server.middlewares.use((req, res) => {
    const url = req.url?.split("?")[0] || "";

    let filePath = path.join("dist", url);

    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      return res.end("404");
    }

    const ext = path.extname(filePath).slice(1);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      return res.end("404");
    }

    res.setHeader("Content-Type", mime.getType(ext) || "text/plain");

    return fs.createReadStream(filePath).pipe(res);
  });
};
