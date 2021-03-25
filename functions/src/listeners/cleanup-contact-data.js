const firebase = require('../service/firebase');

module.exports = firebase.firestoreListener
    .document("contacts/{contactId}")
    .onDelete(async function(snap, context) {
        const shopId = snap.data().shopId
        const contactId = snap.data().contactId
        const snapshot = await firebase.firestore
            .collection('shop_requests')
            .where('shopId', '==', shopId)
            .where('contactId', '==', contactId)
            .get()

        const promises = [];
        snapshot.forEach((d) => {
            promises.push(firebase.firestore.collection('shop_requests').doc(d.id).delete());
        })
        await Promise.all(promises);
    })
