'use strict';
require('dotenv').config({path: '../.env'});

const pkg = require('../package.json');
process.env.VERSION = pkg.version;

import express from 'express';
import GitHub from './lib/github/github.js';
import Trello from './lib/trello/trello.js';
import Twitter from './lib/twitter/twitter.js';
import Answer from './lib/answer/answer.js';
import Names from './lib/translit/translit.js';
import Utilities from './lib/utilities/utilities.js';

const app = express()
    , PORT = process.env.PORT || 3003
    , gitHub = new GitHub()
    , trello = new Trello()
    , answer = new Answer()
    , twitter = new Twitter()
    , utilities = new Utilities();

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
app.get('/github/check/:login', function (req, res) {
    gitHub.searchForUser(req.params.login).then( result => {
        (result.length > 0) ? answer.success(res) : answer.fail(res);
    }).catch( error => {
        answer.fail(res, error);
    });
});

// Check if there are such trello user
app.get('/trello/check/:login', function (req, res) {
    trello.searchForUser(req.params.login).then( result => {
        (result.length > 0) ? answer.success(res, result) : answer.fail(res);
    }).catch( error => {
        answer.fail(res, error);
    });
});

// Check if there are such twitter user
app.get('/twitter/check/:login', function (req, res) {
    twitter.searchForUser(req.params.login).then( result => {
        (result.length > 0) ? answer.success(res, result) : answer.fail(res);
    }).catch( error => {
        answer.fail(res, error);
    });
});

// Search for autofill information
app.get('/autofill/:keywords', function (req, res) {

    let names = new Names(JSON.parse(req.params.keywords))
        , promises = [];

    promises.push(new Promise((resolve, reject) => {
        gitHub.searchForUsers(names).then( result => {
            let promises = [];
            for (let user of utilities.flatten(result)) {
                if (user.type === "User") promises.push(gitHub.getUser(user.login));
            }
            Promise.all(promises)
                .then( result => resolve({'github':utilities.flatten(result)}) )
                .catch( error => reject(error) );
        }).catch( error => {
            answer.fail(res, error);
        });
    }));

    promises.push(new Promise((resolve, reject) => {
        trello.searchForUsers(names).then( result => {
            resolve({'trello': utilities.flatten(result)})
        }).catch( error => {
            answer.fail(res, error);
        });
    }));

    promises.push(new Promise((resolve, reject) => {
        twitter.searchForUsers(names).then( result => {
            resolve({'twitter': utilities.flatten(result)})
        }).catch( error => {
            answer.fail(res, error);
        });
    }));

    Promise.all(promises).then( responses => {
       let users = {};
       for (let response of responses) {
           Object.assign(users, response);
       }

       answer.success(res, users);
    }).catch( error => {
        answer.fail(res, error);
    });
});

export default app;