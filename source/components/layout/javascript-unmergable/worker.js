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

self.addEventListener( 'install', function (event) {
    console.log('install', CACHE_NAME);
});

self.addEventListener( 'activate', function (event) {
    console.log('activate', CACHE_NAME);
});

self.addEventListener( 'fetch', function (event) {
    console.log('fetch', CACHE_NAME);
    console.log('событие', event);
    console.log('Запрашивается: ', event.request.url);

    caches.open(CACHE_NAME).then(function (cache) {
        event.respondWith(
            cache.match(event.request.url).then(function(response){
                return response;
            }).catch(function () {
                let domain = event.request.url.replace('http://','').replace('https://','').split(/[/?#]/)[0];
                fetch(event.request.url).then(function ( response ) {
                    if (domain === "moto.courses") {
                        return response;
                    } else {
                        return cache.put(event.request.url, response);
                    }
                });
            })
        );
    });

});
