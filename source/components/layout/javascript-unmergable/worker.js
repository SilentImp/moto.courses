self.addEventListener('activate', function(event) {
    console.log('Activate');
});

self.addEventListener('fetch', function(event) {
    console.log('Handling fetch event for: ', event.request.url);
});

this.addEventListener('fetch', function(event) {
    console.log('Handling fetch event for: ', event.request.url);
});