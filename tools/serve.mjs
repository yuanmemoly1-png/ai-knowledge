#!/usr/bin/env node
// 一个极简静态服务器，用于本地预览与手机同局域网测试
// 用法: node tools/serve.mjs [port]    （默认 8788）
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.argv[2]) || 8788;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const abs = path.join(ROOT, p);
  if (!abs.startsWith(ROOT)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  fs.readFile(abs, (err, buf) => {
    if (err) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404 " + p);
      return;
    }
    res.writeHead(200, {
      "content-type": TYPES[path.extname(abs).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(buf);
  });
});

server.listen(PORT, () => {
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i.address);
  console.log(`[serve] http://localhost:${PORT}/interview/`);
  for (const ip of ips) console.log(`[serve] 手机同局域网可访问: http://${ip}:${PORT}/interview/`);
});
