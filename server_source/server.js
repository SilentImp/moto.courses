'use strict';

import express from 'express';
import fs from 'fs';
import http from 'http';

const app = express()
    , PORT = process.env.PORT || 3004;

// Listen for requests
app.listen(PORT, () => {
    console.log('Server listening on', PORT);
});

// Set crossorigin headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.head('/cache/', function (req, res, next) {
    fs.stat('../../moto.courses', function(err, stats) {
        res.setHeader('Last-modified', stats.mtime.getTime());
        res.status(200).end(http.STATUS_CODES[200]);
    });
});

// Load static
app.use(express.static(__dirname + '/../build'));

export default app;