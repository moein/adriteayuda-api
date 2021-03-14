const firebase = require('../service/firebase');

module.exports = firebase.firestoreListener
    .document('shop_members/{docId}')
    .onWrite(async (change, context) => {
        const membership = change.after.exists ? change.after.data() : change.before.data()
        const userId = membership.userId
        const memberships = await firebase.firestore.collection('shop_members').where('userId', '==', userId).get()
        const roles = {}
        memberships.forEach((m) => {
            roles[m.data().shopId] = m.data().role
        })
        const shopIds = Object.keys(roles)
        await firebase.firestore.collection('profiles').doc(userId).update('shopIds', shopIds)
        const claims = { roles }
        console.log(`Updating user ${userId} custom claims to ${JSON.stringify(claims)}`)
        await firebase.auth.setCustomUserClaims(userId, claims)
    })
