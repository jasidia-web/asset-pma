// Minimal app-shell cache so the installed icon opens instantly on Android.
// This does NOT cache your asset data — data always comes live from GitHub
// (or from local storage), so you still need internet to sync changes.
var CACHE_NAME = 'asset-pma-shell-v1';
var SHELL_FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(SHELL_FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  // Never cache GitHub API calls or any cross-origin data request — always go live.
  if(url.indexOf('api.github.com') > -1 || event.request.method !== 'GET'){
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request);
    })
  );
});
