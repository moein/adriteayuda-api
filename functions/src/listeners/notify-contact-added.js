const firebase = require('../service/firebase');
const notification = require('../service/notification');

module.exports = firebase.firestoreListener
    .document("contacts/{contactId}")
    .onCreate(async function(snap, context) {
        const contact = snap.data();
        const shop = await firebase.firestore.collection('shops').doc(contact.shopId).get();
        const shopData = shop.data();
        const user = await firebase.firestore.collection('profiles').doc(contact.creatorId).get();
        const userData = user.data();

        const payload = {
            shopName: shopData.name,
            creatorName: userData.name,
            creatorPhone: shopData.phone,
            contactName: contact.name
        }
        const message = {type: 'added_as_contact', payload};
        await notification.notifyBySms(contact.phone, message, {trigger: `contacts/${context.params.contactId}:onCreate`, ...contact});
    });
