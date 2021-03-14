const firebase = require('../service/firebase');
const notificationService = require('../service/notification');

module.exports = firebase.firestoreListener
    .document("shop_requests/{requestId}")
    .onCreate(async function(snap, context) {
        const request = snap.data();
        const shop = await firebase.firestore.collection('shops').doc(request.shopId).get();
        const shopData = shop.data();
        const profile = await firebase.firestore.collection('profiles').doc(request.requesterId).get();
        const profileData = profile.data();
        const contact = await firebase.firestore.collection('contacts').doc(request.contactId).get();
        const contactData = contact.data();

        const payload = {
            shopName: shopData.name,
            contactName: contactData.name,
            requesterName: profileData.name,
            requesterPhone: request.requesterPhone,
        }
        switch (request.type) {
            case 'request_call':
                payload.reason = request.reason;
                break;
            case 'request_products':
                payload.products = request.products;
                break
            default:
                console.log(`Got "${request.type}" which is not supported by this function`)
                return
        }
        const notification = {type: request.type, payload};
        await notificationService.notifyBySms(contactData.phone, notification, {trigger: `shop_requests/${context.params.requestId}:onCreate`, request});
    });
