// PM 站 Service Worker：网络优先 + 离线回落（作用域 ./ 即 /pm/）
const VERSION = "pm-v1-2026-09-18";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/app.js",
  "./data/pm-outline.js",
  "./data/pm-a.js",
  "./data/pm-b.js",
  "./data/pm-c.js",
  "./data/pm-d.js",
  "./data/pm-extra.js",
  "./data/pm-questions.js",
  "../interview/assets/style.css",
  "../interview/assets/md.js",
  "../interview/data/interviews.js",
  "../interview/data/questions.js",
  "../interview/data/iv-deep-s.js",
  "../interview/data/iv-deep-ab.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) { const c = await caches.open(VERSION); c.put("./index.html", res.clone()); }
        return res;
      } catch {
        const c = await caches.open(VERSION);
        return (await c.match("./index.html", { ignoreSearch: true })) || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    try {
      const res = await fetch(req);
      if (res && res.ok) c.put(req, res.clone());
      return res;
    } catch {
      const hit = await c.match(req, { ignoreSearch: true });
      return hit || new Response("offline", { status: 503, statusText: "offline" });
    }
  })());
});

self.addEventListener("message", (e) => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
