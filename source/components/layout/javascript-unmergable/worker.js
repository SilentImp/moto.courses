self.addEventListener( 'activate', function (event) {
    console.log('Activate');

    self.addEventListener( 'fetch', function (event) {
        console.log('this Handling fetch event for: ', event.request.url);
    });
});