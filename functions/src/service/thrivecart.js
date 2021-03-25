const firebase = require('../service/firebase');
const config = require('../../config');

module.exports = {
    webhook: (callback) => {
        return firebase.httpFunction.onRequest(async (req, res) => {
            if (req.method === 'HEAD') {
                return res.send('');
            }
            if (!req.body) {
                return res.status(400).send('Missing body');
            }
            const payload = req.body;
            if (payload.thrivecart_secret !== config.thrivecart.webhookSecret) {
                firebase.logger.warn('Invalid thrivecart secret');
                res.status(400).send('Invalid thrivecart secret')
            } else {
                try {
                    await callback(req, res, payload);
                } catch (e) {
                    firebase.logger.error(e);
                    res.status(500)
                }

                res.send();
            }

        })
    }
}
