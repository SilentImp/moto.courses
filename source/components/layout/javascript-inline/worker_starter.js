(function () {
    if (typeof SharedWorker !== "function") return;
    const black = new SharedWorker("https://moto.courses/javascript/work.js", "cache");
})();