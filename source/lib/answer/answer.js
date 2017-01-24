/**
 * @class Answer — send answer to client
 */
export default class Answer {

    /**
     * Operation has failed
     * @param res {Object} —  object represents the HTTP response that an Express app sends when it gets an HTTP request.
     * @param payload {Object} — any additional payload
     */
    fail (res, payload) {
        let answer = {success: false};
        if (typeof payload !== "undefined") {
            answer.payload = payload;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(answer));
        res.end();
    }

    /**
     * Operation has succeed
     * @param res {Object} —  object represents the HTTP response that an Express app sends when it gets an HTTP request.
     * @param payload {Object} — any additional payload
     */
    success (res, payload) {
        let answer = {success: true};
        if (typeof payload !== "undefined") {
            answer.payload = payload;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(answer));
        res.end();
    }
}