const firebase = require('../service/firebase');

async function updateUsers(accountId, disabled) {
    const userDocs = await firebase.firestore.collection('profiles').where('accountId', '==', accountId).get();
    const userIds = [];
    userDocs.forEach(u => {
        userIds.push(u.id);
    });
    for (const id of userIds) {
        await firebase.auth.updateUser(id, {
            disabled
        });
    }
}

module.exports = firebase.firestoreListener
    .document('accounts/{accountId}')
    .onUpdate(async (change, context) => {
        await updateUsers(context.params.accountId, change.after.data().subscriptionExpired);
    });
