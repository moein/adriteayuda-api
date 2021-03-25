const createHmac = require('crypto').createHmac;
const firebase = require('../service/firebase');
const config = require('../../config');

const isSignatureValid = request => {
    if (!request.rawBody) {
        return false;
    }
    const payloadHash = createHmac("sha256", config.typeform.hookSecret.toString())
        .update(request.rawBody)
        .digest("base64");
    const typeformSignature = request.header('Typeform-Signature');
    return `sha256=${payloadHash}` === typeformSignature;
}

module.exports = {
    mapAnswers: (formResponse) => {
        const m = {};
        for (const answer of formResponse.answers) {
            if (answer.email) {
                m[answer.field.ref] = answer.email
            } else if (answer.text) {
                m[answer.field.ref] = answer.text
            } else if (answer.phone_number) {
                m[answer.field.ref] = answer.phone_number
            } else {
                firebase.logger.error(`Unknown typeform answer type: ${JSON.stringify(answer)}`)
            }
        }

        return m;
    },
    webhook: (callback) => {
        return firebase.httpFunction.onRequest((req, res) => {
            if (!isSignatureValid(req)) {
                firebase.logger.warn('Invalid signature for tf request');
                res.status(400).send('')
            } else {
                callback(req, res);
            }
        })
    }
}
