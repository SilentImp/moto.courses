const fetch = require('node-fetch');

/**
 * @class Trello — set of methods to work with trello api using promises
 */
export default class Trello {

    /**
     * @constructor
     */
    constructor () {

        for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            const method = this[name];
            if (name !== 'constructor' && typeof method === 'function') {
                this[name] = method.bind(this);
            }
        }

        this.options = {
            key: process.env.TRELLO_KEY,
            token: process.env.TRELLO_TOKEN
        };

        this.urls = {
            api: "https://api.trello.com/1/",
            search_users: "search/members/?key=" + this.options.key + "&token=" + this.options.token 
        };
    }

    /**
     * Search for users
     * @param {Array} keywords
     * @return {Promise} 
     */
    searchForUsers (keywords) {
        if (!Array.isArray(keywords) && (typeof keywords == "string")) {
            keywords = new Array(keywords);
        }
        let promises = [];
        for (let keyword of keywords) {
            promises.push(this.searchForUser(keyword));
        }
        return Promise.all(promises);
    }

    /**
     * Search for user
     * @param {String} keyword
     * @return {Promise} 
     */
    searchForUser (keyword) {
        return new Promise((resolve, reject) => {
            let options = {
                'method': 'GET'
            };
            fetch(this.urls.api + this.urls.search_users + '&query=' + encodeURIComponent(keyword), options).then(response => {
                return response.json();
            }).then(response => {
                let users = [];
                for(let user of response) {
                    let {username, fullName, email, avatarHash, gravatarHash} = user;
                    users.push({login: username, name: fullName, email, avatarHash, gravatarHash});
                }
                return users;
            }).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        });
    }
}