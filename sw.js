const NOME_CACHE = "mylist-v15";
const FILE_DA_METTERE_IN_CACHE = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", evento => {
  evento.waitUntil(
    caches.open(NOME_CACHE).then(cache => cache.addAll(FILE_DA_METTERE_IN_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys().then(nomiCache =>
      Promise.all(
        nomiCache
          .filter(nome => nome.startsWith("mylist-") && nome !== NOME_CACHE)
          .map(nome => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", evento => {
  if (evento.request.method !== "GET") return;
  if (!evento.request.url.startsWith(self.registration.scope)) return;

  evento.respondWith(
    caches.match(evento.request).then(rispostaCache => {
      if (rispostaCache) return rispostaCache;

      return fetch(evento.request)
        .then(rispostaRete => {
          const copiaRisposta = rispostaRete.clone();
          caches.open(NOME_CACHE).then(cache => cache.put(evento.request, copiaRisposta));
          return rispostaRete;
        })
        .catch(() => rispostaCache);
    })
  );
});
