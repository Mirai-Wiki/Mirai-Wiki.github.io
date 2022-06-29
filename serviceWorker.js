const staticMiraiWiki = "mirai-wiki-site-v0.1";
const assets = [
    "/",
    "/index.html",
    "/style.css",
    "eventEmitter.js",
    "mouse.js",
    "/main.js"
];

self.addEventListener("install", (evt) => {
    evt.waitUntil(
        caches.open(staticMiraiWiki).then((cache) => {
            cache.addAll(assets);
        })
    );
});
