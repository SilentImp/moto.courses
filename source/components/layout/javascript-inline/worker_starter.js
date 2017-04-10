(function () {
    if ( typeof SharedWorker !== "function" ) return;
    navigator.serviceWorker.register( "/javascript/work.js" , { scope: '/' } ).then( function( reg ) {
        console.log( 'Регистрация сработала ' + reg.scope );
    }).catch( function( error ) {
        console.log( 'Регистрация прошла неудачно ' + error );
    });
})();