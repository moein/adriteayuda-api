const admin = require('firebase-admin');
admin.initializeApp();

module.exports = {
    notifyNewShopRequest: require('./src/listeners/notify-new-shop-request'),
    notifyContactAdded: require('./src/listeners/notify-contact-added')
};
