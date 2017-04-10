(function () {
    if (typeof SharedWorker !== "function") return;
    const black = new SharedWorker("/javascript/worker.js", "cache");
    
})();