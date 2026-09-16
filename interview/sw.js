// Service Worker：网络优先 + 离线回落
// v6 起改为 network-first —— 在线时永远拿到最新版，断网时用缓存兜底
const VERSION = "v6-2026-09-16";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/md.js",
  "./assets/app.js",
  "./data/index.js",
  "./data/textbook.js",
  "./data/tb-p0p1a.js",
  "./data/tb-p1b.js",
  "./data/tb-p2.js",
  "./data/tb-p3a.js",
  "./data/tb-p3b.js",
  "./data/tb-p4.js",
  "./data/tb-p5.js",
  "./data/tb-p6.js",
  "./data/tb-p7a.js",
  "./data/tb-p7b.js",
  "./data/tb-p7c.js",
  "./data/tb-p7d.js",
  "./data/quotes.js",
  "./data/questions.js",
  "./data/media-bank.js",
  "./data/interviews.js",
  "./data/iv-deep-s.js",
  "./data/iv-deep-ab.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const c = await caches.open(VERSION);
      // 单个资源失败不阻断安装
      await Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const ks = await caches.keys();
      await Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 页面导航：网络优先，断网回落 index.html
  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res && res.ok) {
            const c = await caches.open(VERSION);
            c.put("./index.html", res.clone());
          }
          return res;
        } catch {
          const c = await caches.open(VERSION);
          return (await c.match("./index.html", { ignoreSearch: true })) || Response.error();
        }
      })()
    );
    return;
  }

  // 其它同源资源：网络优先（自动享受 HTTP 缓存），失败回落离线缓存
  e.respondWith(
    (async () => {
      const c = await caches.open(VERSION);
      try {
        const res = await fetch(req);
        if (res && res.ok) c.put(req, res.clone());
        return res;
      } catch {
        const hit = await c.match(req, { ignoreSearch: true });
        if (hit) return hit;
        return new Response("offline", { status: 503, statusText: "offline" });
      }
    })()
  );
});

// 允许页面主动要求激活新版本
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
