// Minimal app-shell cache so the installed icon opens instantly on Android.
// This does NOT cache your asset data — data always comes live from GitHub
// (or from local storage), so you still need internet to sync changes.
//
// IMPORTANT: bump CACHE_NAME every time you deploy a new index.html, otherwise
// browsers won't notice sw.js changed and will keep serving the old cached shell.
var CACHE_NAME = 'asset-pma-shell-v2';
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
  // Never cache GitHub API calls or any non-GET request — always go live.
  if(url.indexOf('api.github.com') > -1 || event.request.method !== 'GET'){
    return;
  }

  // Network-first for the app shell itself (index.html, manifest, icons):
  // always try to fetch the latest version first, and only fall back to the
  // cached copy if there's no internet. This is what keeps the installed app
  // in sync with whatever you last uploaded to GitHub.
  event.respondWith(
    fetch(event.request).then(function(fresh){
      var copy = fresh.clone();
      caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
      return fresh;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
