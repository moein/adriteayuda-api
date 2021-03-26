const firebase = require('../service/firebase');

async function disableAccount(accountId) {
   await firebase.firestore.collection('accounts').doc(accountId).update({
      subscriptionExpired: true
   });
}

module.exports = firebase.httpFunction.onRequest(async (req, res) => {
   const accountId = req.body.accountId;
   if (!accountId) {
      return res.status(400).send('Missing account id');
   }
   const account = await firebase.firestore.collection('accounts').doc(accountId).get()
   const spId = account.data().currentSubscriptionPeriodId;
   const sp = await firebase.firestore.collection('subscription_periods').doc(spId).get();
   if (!sp.exists) {
      firebase.logger.error(`Failed to find subscription for account ${accountId}`);
      await disableAccount(accountId);
      return res.send('');
   }
   if (sp.data().endTimestamp.toMillis() < new Date().getTime()) {
      await disableAccount(accountId);
   }

   res.send('');
});
