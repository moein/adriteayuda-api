const admin = require('firebase-admin');
admin.initializeApp();

module.exports = {
    notifyNewShopRequest: require('./src/listeners/notify-new-shop-request'),
    notifyContactAdded: require('./src/listeners/notify-contact-added'),
    updateCustomClaims: require('./src/listeners/update-custom-claims'),
    updateAccountCurrentSubscription: require('./src/listeners/update-account-current-subscription'),
    cleanupContactData: require('./src/listeners/cleanup-contact-data'),
    updateAccountUsers: require('./src/listeners/update-account-users'),
    // http
    inviteUser: require('./src/http/invite-user'),
    thrivecartSubscription: require('./src/http/thrivecart-subscription'),
    checkSubscription: require('./src/http/check-subscription'),
};
