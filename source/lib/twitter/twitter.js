const fetch = require('node-fetch')
    , crypto  = require('crypto')
    , OAuth = require('oauth-1.0a');

/**
 * @class Twitter — set of methods to work with twitter api using promises
 */
export default class Twitter {

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

        this.config = {
            consumer_key: process.env.TWITTER_CUSTOMER_KEY,
            consumer_key_secret: process.env.TWITTER_CUSTOMER_KEY_SECRET,
            access_tocken: process.env.TWITTER_TOKEN,
            access_tocken_secret: process.env.TWITTER_TOKEN_SECRET
        }

        this.oauth = OAuth({
            consumer: {
                key: this.config.consumer_key,
                secret: this.config.consumer_key_secret
            },
            signature_method: 'HMAC-SHA1',
            hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
        });

        this.token = {
            key: this.config.access_tocken,
            secret: this.config.access_tocken_secret
        };

        this.urls = {
            api: "https://api.twitter.com/1.1/",
            search_users: "users/search.json?page=1&count=2&q="
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
            let url=this.urls.api + this.urls.search_users + encodeURIComponent(keyword)
                , options = {
                    headers: this.oauth.toHeader(this.oauth.authorize({url, method: 'GET'}, this.token)),
                    json: true
                };
            fetch(url, options).then(response => {
                return response.json();
            }).then(response => {
                let users = [];
                for(let user of response) {
                    let {id, name, screen_name, entities, profile_image_url} = user,
                        url = [];
                    for(let element in entities) {
                        for(let uri of entities[element].urls) {
                            url.push(uri.expanded_url);
                        }
                    }
                    users.push({
                        name: name,
                        login: screen_name,
                        urls: url,
                        profile_image_url: profile_image_url
                    });
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