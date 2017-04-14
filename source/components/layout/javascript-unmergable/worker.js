const CURRENT = Date.now() // Current date
  , TTL = 1000 * 60 * 60 * 24 * 7 // Cache lives 7 days
  , REQUEST_DELAY = 1000 * 60 * 60 * 6 // Check cache validity one time per 6 hours

let CACHE_NAME; // Cache name

/**
 * Check all caches and delete all caches that older the three days
 */
caches.keys().then(function(cacheNames) {
    for (let index in cacheNames) {
        let diff = Math.abs(CURRENT - cacheNames[index]);
        if (!isNaN(diff) && diff < TTL ) {
            CACHE_NAME = cacheNames[index];
        } else {
            caches.delete(cacheNames[index]);
        }
    }
    if (typeof CACHE_NAME === "undefined") CACHE_NAME = CURRENT;
});

/**
 * On each request cache it
 */
self.addEventListener( 'fetch', function (event) {

    let domain = event.request.url.replace('http://','').replace('https://','').split(/[/?#]/)[0];
    // We should cache only assets
    if (domain !== "moto.courses") return;

    event.respondWith(caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request.url).then(function(response){
            if (typeof response !== "undefined") return response;
            return fetch(event.request.url);
        }).then(function (response) {
            cache.put(event.request, response.clone());
            return response;
        });
    }));
});

/**
 * On activation worker validate cache and repeat it every six hours
 */
self.addEventListener( 'activate', function (event) {
    setInterval(checkCache, REQUEST_DELAY);
    checkCache();
});

/**
 * Get Last Modified header and clean cache if needed
 */
function checkCache () {
    fetch('/cache/', {
        method: 'HEAD'
    }).then( function (response) {
        if (parseInt(response.headers.get('Last-modified'), 10) > CACHE_NAME) caches.delete(CACHE_NAME);
    });
};