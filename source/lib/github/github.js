const fetch = require('node-fetch');

/**
 * @class Github — set of methods to work with github api using promises
 */
export default class Github {

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
        
        this.urls = {
            api: "https://api.github.com/",
            search_users: "search/users",
            users: "users/"
        };

        this.headers = {
            Authorization: 'token ' + process.env.GITHUB_SECRET_TOKEN,
            Accept: 'application/vnd.github.v3+json',
            userAgent: 'UserCrowler/' + process.env.VERSION
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
                'method': 'GET',
                'headers': this.headers
            };
            fetch(this.urls.api + this.urls.search_users + '?q=' + encodeURIComponent(keyword), options).then(response => {
                return response.json();
            }).then(response => {
                console.log('github finded: ', response);
                if (typeof response.items === "undefined") reject(response);
                resolve(response.items);
            }).catch(error => {
                console.log('github error: ', error);
                reject(error);
            });
        });
    }

    /**
     * Get user information
     * @param {String} login
     * @return {Promise} 
     */
    getUser (login) {
        return new Promise((resolve, reject) => {
            let options = {
                method: 'GET',
                headers: this.headers
            };
			fetch(this.urls.api + this.urls.users + encodeURIComponent(login), options).then(response => {
                return response.json();
            }).then(response => {
				let {login, blog, name, email, avatar_url, gravatar_id, company} = response;
				resolve({login, blog, name, email, avatar_url, gravatar_id, company});
            }).catch(error => {
                reject(error);
            });
		});
    }
};