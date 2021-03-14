const firebase = require('../service/firebase');
const notificationService = require('../service/notification');

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
        const notification = {type: 'added_as_contact', payload};
        const text = `Hola ${contact.name}! ${userData.name} de la tienda ${shopData.name} te ha agregado como contacto en la aplicacion AdriTeAyuda. Para mas info: %LINK%`;

        await notificationService.notifyBySmsWithCustomText(
            contact.phone,
            notification,
            text,
            {trigger: `contacts/${context.params.contactId}:onCreate`, contact}
        );
    });
