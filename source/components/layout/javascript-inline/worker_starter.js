(function () {
    if ( typeof SharedWorker !== "function" ) return;
    serviceWorker.register( "/worker.js" , { scope: '/' } ).then( function( reg ) {
        console.log( 'Регистрация сработала для скоупа: ' + reg.scope );
    }).catch( function( error ) {
        console.log( 'Регистрация прошла неудачно ' + error );
    });
})();