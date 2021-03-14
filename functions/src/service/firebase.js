const functions = require("firebase-functions");
const admin = require('firebase-admin');

module.exports = {
    firestoreListener: functions.region('europe-west3').firestore,
    createCallableFunction: functions.region('europe-west3').https,
    firestore: admin.firestore(),
    firestoreNow: admin.firestore.Timestamp.fromDate(new Date()),
    auth: admin.auth()
}
