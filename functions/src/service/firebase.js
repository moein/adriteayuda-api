const functions = require("firebase-functions");
const admin = require('firebase-admin');
const config = require('../../config');
const http = require('../service/http');

const fWithOpt = functions.runWith({timeoutSeconds: 10}).region(config.gcloud.location);

module.exports = {
    firestoreListener: fWithOpt.firestore,
    httpFunction: http,
    firestore: admin.firestore(),
    firestoreTimestamp: {
        fromSeconds: s => new admin.firestore.Timestamp(parseInt(s), 0)
    },
    firestoreNow: admin.firestore.Timestamp.now(),
    auth: admin.auth(),
    logger: functions.logger
}
