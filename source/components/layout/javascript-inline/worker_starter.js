(function () {
    if ( !navigator.serviceWorker ) return;
    navigator.serviceWorker.register( "/worker.js" , { scope: '/' } ).then( function( reg ) {
        console.log( 'Регистрация сработала для скоупа: ' + reg.scope );
    }).catch( function( error ) {
        console.log( 'Регистрация прошла неудачно ' + error );
    });
})();