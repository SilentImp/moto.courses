/**
 * @class Answer — middleware, that send answer to client
 */
export default class Answer {

    /**
     * Operation has failed
     * @param err {Object} - error
     * @param req {Object} - http request
     * @param res {Object} —  http response
     * @param next {Object} — next middleware
     */
    fail (err, req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            success: false,
            payload: err
        }));
        res.end();
    }

    /**
     * Operation has succeed
     * @param res {Object} —  object represents the HTTP response that an Express app sends when it gets an HTTP request.
     * @param payload {Object} — any additional payload
     */
    success (req, res, next) {
        let answer = {success: true};
        if (typeof res.payload !== "undefined") {
            answer.payload = res.payload;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(answer));
        res.status(200).end();
    }
}