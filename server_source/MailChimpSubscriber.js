import fetch from 'isomorphic-fetch';

/**
 * @class MailChimpSubscriber — toolset add email to the list
 */
export default class MailChimpSubscriber {
  /**
   * Create class instance with api url and token
   * @constructor
   * @param {string} token - mailChimp token
   * @param {string} url   - mailChimp bucket url
   */
  constructor (token, url) {
    this.token = token;
    this.url = url;
  }
  
  /**
   * Add email to the list
   * 
   * @param  {string} email - email
   * @param  {string} list  - list id
   * @return {object}       - server answer 
   * @throw  {Error}        - throw error if something have go wrong
   * @link http://developer.mailchimp.com/documentation/mailchimp/reference/lists/members/
   *
   * @example <caption>Add email to the list</caption>
   * import MailChimpSubscriber from './MailChimpSubscriber';
   * (async () => {
   *   const chimp = new MailChimpSubscriber(
   *    'b3eac318f2e54f183cc9da9445f579e7-us12', 
   *    'https://us12.api.mailchimp.com/3.0/'
   *   );
   *   try {
   *    await chimp.subscribe('silent.imp@gmail.com', 'eb4e666ed9');
   *   } catch (error) {
   *    console.error(error;)
   *   }
   * })();
   */
  subscribe (email, list) {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `apikey ${this.token}`,
        Accept: 'application/json; charset=utf-8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        status: 'subscribed',
      }),
    };
    const response = await fetch(`${this.url}/lists/${list}/members`, options);
    const json = await response.json();
    if (response.ok) return json;
    throw new Error(JSON.stringify(json));
  }
}