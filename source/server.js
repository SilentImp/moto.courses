'use strict';

import defaultMember from './lib/env/env.js';
import express from 'express';
import Routes from './lib/routes/routes.js';
import Answer from './lib/answer/answer.js';


const app = express()
    , PORT = process.env.PORT || 3003
    , routes = new Routes()
    , answer = new Answer();

// Listen for requests
app.listen(PORT, () => {
    console.log('Server listening on', PORT);
});

// Set crossorigin headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Check if there are such github user
app.get('/github/check/:login', routes.getGitHubUsers);

// Check if there are such trello user
app.get('/trello/check/:login', routes.getTrelloUsers);

// Check if there are such twitter user
app.get('/twitter/check/:login', routes.getTwitterUsers);

// Check if url answering
app.get('/url/check/:url', routes.checkURL);

// Search for autofill information
app.get('/autofill/:keywords', routes.userAutofill);

// On success send user status and data payload
app.use(answer.success);

// On fail send user status and error information
app.use(answer.fail);

export default app;