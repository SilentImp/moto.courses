let CURRENT = Date.now() // Current date
  , TTL = 1000 * 60 * 60 * 24 * 3 // Three days
  , CACHE_NAME; // Cache name

caches.keys().then(function(cacheNames) {
    
    for (let index in cacheNames) {
        console.log(CURRENT, cacheNames[index], CURRENT - cacheNames[index], TTL);
        let diff = Math.abs(CURRENT - cacheNames[index]);
        if (!isNaN(diff) && diff < TTL ) {
            console.log('до 3х дней');
            CACHE_NAME = cacheNames[index];
        } else {
            console.log('удаляем кэш: ', cacheNames[index]);
            caches.delete(cacheNames[index]).then(function () {
                console.log('удалили успешно ', arguments);
            }).catch(function (error) {
                console.log('не смогли удалить ', arguments);
            });
        }
    }

    if (typeof CACHE_NAME === "undefined") {
        console.log('нет кеша');
        CACHE_NAME = CURRENT;
    }

});

console.log('boo: ', CACHE_NAME);

self.addEventListener( 'install', function (event) {
    console.log('install', CACHE_NAME);
});

self.addEventListener( 'activate', function (event) {
    console.log('activate', CACHE_NAME);
});

self.addEventListener( 'fetch', function (event) {
    console.log('activate', CACHE_NAME);
    console.log('this Handling fetch event for: ', event.request.url);

    event.respondWith(
        caches.match(event.request, {
            ignoreSearch: true
          , cacheName: CACHE_NAME
        }).then(function (response) {
            // да
            console.log(' Нашли в кэше: ', response);
            return response;
        }).catch(function () {
            // нету
            fetch(event.request.url, {
                method: event.request.method
            }).then(function(response) {
                return response;
            }).catch(function(error) {
                throw new Error(error);
            });
        })
    );
});