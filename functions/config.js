const functions = require("firebase-functions");

module.exports = {
    server: {
        env: functions.config().server.env,
        domain: functions.config().server.domain
    },
    sms: {
        apiToken: functions.config().sms.api_token
    }
}
