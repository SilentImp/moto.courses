(function () {
    if ( !navigator.serviceWorker ) return;
    navigator.serviceWorker.register( "/worker.js" , { scope: '/' } );
})();