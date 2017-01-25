import GitHub from '../github/github.js';
import Trello from '../trello/trello.js';
import Twitter from '../twitter/twitter.js';
import Names from '../translit/translit.js';
import Utilities from '../utilities/utilities.js';

const gitHub = new GitHub()
    , trello = new Trello()
    , twitter = new Twitter()
    , utilities = new Utilities()
    , urlExists = require('url-exists');

/**
 * @class Class containing routes middleware
 */
export default class Routes {

    /**
     * Search for github users
     * @param req {Object} - http request
     * @param res {Object} — http response
     * @param next {Object} — next middleware
     */
    getGitHubUsers (req, res, next) {
        gitHub.searchForUser(req.params.login).then( result => {
            (result.length > 0) ? next() : next('No users found');
        }).catch( error => {
            next(error);
        });
    }

    /**
     * Search for trello users
     * @param req {Object} - http request
     * @param res {Object} — http response
     * @param next {Object} — next middleware
     */
    getTrelloUsers (req, res, next) {
        trello.searchForUser(req.params.login).then( result => {
            if (result.length == 0) next('No users found');
            res.payload = result;
            next();
        }).catch( error => {
            next(error);
        });
    }

    /**
     * Search for twitter users
     * @param req {Object} - http request
     * @param res {Object} — http response
     * @param next {Object} — next middleware
     */
    getTwitterUsers (req, res, next) {
        twitter.searchForUser(req.params.login).then( result => {
            if (result.length == 0) next('No users found');
            res.payload = result;
            next();
        }).catch( error => {
            next(error);
        });
    }

    /**
     * Check if url available
     * @param req {Object} - http request
     * @param res {Object} — http response
     * @param next {Object} — next middleware
     */
    checkURL (req, res, next) {
        urlExists(req.params.url, function(error, exists) {
        exists ? next() : (error === null) ? next('URL unavailable') : next(error);
        });
    }

    /**
     * Search for user data by multiple keywords
     * @param req {Object} - http request
     * @param res {Object} — http response
     * @param next {Object} — next middleware
     */
    userAutofill (req, res, next) {

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
                next(error);
            });
        }));

        promises.push(new Promise((resolve, reject) => {
            trello.searchForUsers(names).then( result => {
                resolve({'trello': utilities.flatten(result)})
            }).catch( error => {
                next(error);
            });
        }));

        promises.push(new Promise((resolve, reject) => {
            twitter.searchForUsers(names).then( result => {
                resolve({'twitter': utilities.flatten(result)})
            }).catch( error => {
                next(error);
            });
        }));

        Promise.all(promises).then( responses => {
            let users = {};
            for (let response of responses) {
                Object.assign(users, response);
            }

            res.payload = users;
            next();
        }).catch( error => {
            next(error);
        });
    }

}