const crypto = require('crypto');
const config = require('../../config');
const firebase = require('../service/firebase');
const stripHtml = require('string-strip-html').stripHtml;

/**
 * @param {Object} message
 * @param {string} message.subject
 * @param {string} message.html
 * @param {string} recipient
 * @param addFooterHelp
 * @returns {Promise<void>}
 */
async function sendMail(message, recipient, addFooterHelp = false) {
    if (addFooterHelp) {
        message.html += '<br><br>Si tienes alguna duda me puedes contactar enviándome un whatsapp a <a href="https://wa.me/34‭679196286">‭679 196 286</a>'
    }
    Object.assign(message, {text: message.html});

    await firebase.firestore.collection('mails').add({
        to: recipient,
        message,
    })
}

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

async function createNotification (phone, message, debug) {
    message.timestamp = firebase.firestoreNow;
    debug.timestamp = firebase.firestoreNow;
    const token = crypto.randomBytes(48).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    await firebase.firestore.collection('notifications').doc(token).set(message);
    await firebase.firestore.collection('notification_debug').doc(token).set({phone, message, debug})

    return token
}

function createNotificationLink(token) {
    return `https://${config.server.domain}/m?t=${token}`;
}

async function notifyBySms (phone, notification, debug) {
    const token = await createNotification(phone, notification, debug)
    await sendSms(`Tienes un mesnsaje nuevo de AdriTeAyuda: ${createNotificationLink(token)}`, phone);
}

async function notifyBySmsWithCustomText (phone, notification, smsText, debug) {
    const token = await createNotification(phone, notification, debug)
    await sendSms(smsText.replace('%LINK%', createNotificationLink(token)), phone);
}

module.exports = {
    notifyBySms,
    notifyBySmsWithCustomText,
    sendMail,
}
