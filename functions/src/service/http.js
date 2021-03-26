const functions = require("firebase-functions");
const config = require('../../config');
const defaultOptions = {timeoutSeconds: 10};

function createCallable(type, callback, options) {
    const opt = Object.assign({}, defaultOptions, options);
    return functions.runWith(opt).region(config.gcloud.location).https[`on${type}`](async (req, res) => {
        try {
            await callback(req, res);
        } catch (e) {
            functions.logger.error(e);
            return res.status(500).send();
        }
    });
}

module.exports = {
    onRequest: (callback, options = {}) => {
        return createCallable('Request', callback, options);
    },
    onCall: (callback, options = {}) => {
        return createCallable('Call', callback, options);
    }
}
