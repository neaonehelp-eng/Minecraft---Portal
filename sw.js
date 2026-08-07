var CACHE_NAME = "portal-cache-v1";
var APP_SHELL = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Кэшируем только сам "каркас" приложения (HTML/иконки).
// Запросы к API данных всегда идут в сеть, чтобы курс/чат были актуальными.
self.addEventListener("fetch", function (event) {
  var url = event.request.url;
  if (url.indexOf("jsonblob.com") !== -1) {
    return; // не кэшируем данные — они должны быть всегда свежими
  }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
