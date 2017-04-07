'use strict';

import express from 'express';

const app = express()
    , PORT = process.env.PORT || 3004;

// Listen for requests
app.listen(PORT, () => {
    console.log('Server listening on', PORT);
});

// Set crossorigin headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Load static
app.use(express.static(__dirname + '/../build'));


export default app;