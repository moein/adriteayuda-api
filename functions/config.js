const functions = require("firebase-functions");

module.exports = {
    server: {
        env: functions.config().server.env,
        domain: functions.config().server.domain
    },
    gcloud: {
        location: 'europe-west3'
    },
    sms: {
        apiToken: functions.config().sms.api_token
    },
    typeform: {
        hookSecret: functions.config().typeform.hook_secret
    },
    thrivecart: {
        webhookSecret: functions.config().thrivecart.webhook_secret,
        customerHub: 'https://payment.genyus.tech/updateinfo/'
    }
}
