const crypto = require('crypto');
const config = require('../../config');
const firebase = require('../service/firebase');

async function sendSms(message, recipient) {
    const apiToken = config.sms.apiToken;
    if (!apiToken) {
        console.log('No api token for sms. Skipping sending sms.');
        return;
    }
    const fetch = require("node-fetch"); // npm install node-fetch
    const util = require("util");

    async function sendSMS() {
        const payload = {
            sender: "AdriTeAyuda",
            message,
            recipients: [
                { msisdn: recipient },
            ],
        };


        const encodedAuth = Buffer.from(`${apiToken}:`).toString("base64");

        const resp = await fetch("https://gatewayapi.com/rest/mtsms", {
            method: "post",
            body: JSON.stringify(payload),
            headers: {
                Authorization: `Basic ${encodedAuth}`,
                "Content-Type": "application/json",
            },
        });
        const json = await resp.json()
        console.log(util.inspect(json, {showHidden: false, depth: null}));
        if (resp.ok) {
            console.log("congrats! messages are on their way!");
        } else {
            console.log("oh-no! something went wrong...");
        }
    }

    await sendSMS();
}

async function notifyBySms (phone, message, debug) {
    message.timestamp = firebase.firestoreNow;
    debug.timestamp = firebase.firestoreNow;
    const token = crypto.randomBytes(48).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');;
    await firebase.firestore.collection('notifications').doc(token).set(message);
    await firebase.firestore.collection('notification_debug').doc(token).set({phone, message, debug})
    await sendSms(`Tienes un mesnsaje nuevo de AdriTeAyuda: https://${config.server.domain}/m?t=${token}`, phone);
}

module.exports = {
    notifyBySms
}
