const firebase = require('../service/firebase');

module.exports = firebase.firestoreListener
    .document("subscription_periods/{spId}")
    .onCreate(async function(snap, context) {
        const spData = snap.data();
        await firebase.firestore.collection('accounts').doc(spData.accountId).update({
            currentSubscriptionPeriodId: context.params.spId
        })
    });
