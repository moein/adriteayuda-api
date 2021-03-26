const firebase = require('../service/firebase');
const users = require('../service/users');
const thrivecart = require('../service/thrivecart');
const config = require('../../config');
const jobs = require('../service/jobs');
const notification = require('../service/notification');

async function ensureUser(payload) {
    const customer = payload.customer;
    try {
        const user = await firebase.auth.getUserByEmail(customer.email);
        const profileDoc = await firebase.firestore.collection('profiles').doc(user.uid).get();
        return {accountId: profileDoc.data().accountId, isNew: false};
    } catch (e) {
        const { accountId } = await users.create(
            customer.email,
            customer.name,
            customer.business_name,
            customer.contactno.replace('00', '+')
        )
        return {accountId, isNew: true};
    }
}

async function handleOrderSuccess(payload, thrivecartEventId) {
    const {accountId, isNew} = await ensureUser(payload);
    await addSubscriptionPeriod(payload, thrivecartEventId, accountId);
    if (!isNew) {
        const accountDoc = await firebase.firestore.collection('accounts').doc(accountId).get();
        if (accountDoc.exists && accountDoc.data().subscriptionExpired) {
            await firebase.firestore.collection('accounts').doc(accountId).update({
                subscriptionExpired: false
            })
        }
    }
}

async function addSubscriptionPeriod(payload, eventId, accountId) {
    const charge = payload.order.charges[0];
    const futureCharge = payload.order.future_charges[0];
    const end = parseInt(charge.trial ? charge.trial_ends : futureCharge.defer_date);

    await firebase.firestore.collection('subscription_periods').add({
        state: charge.trial ? 'trial' : 'active',
        thrivecart: {
            customerId: payload.customer_id,
            productId:  charge.reference,
            paymentPlanId: charge.payment_plan_id,
            orderId: payload.order_id,
        },
        eventId,
        accountId,
        planName: `${charge.name} - ${charge.payment_plan_name}`,
        startTimestamp: firebase.firestoreTimestamp.fromSeconds(payload.order.date_unix),
        endTimestamp: firebase.firestoreTimestamp.fromSeconds(end + 6 * 3600),
        creationTimestamp: firebase.firestoreNow,
    })
    await jobs.schedule.byTimestamp('checkSubscription', {accountId}, end - 10);
    if (charge.trial) {
        await jobs.schedule.byTimestamp('remindRenewal', {accountId, email: payload.customer.email},end - 24 * 3600)
    }
}

async function handleRebillFailed(payload) {
    const html = `¡Hola ${payload.customer.name}!
<br><br>
Hemos intentado cobrarte tu subscripcioón de AdriTeAyuda pero no lo hemos conseguido.
<br><br>
No te preocupes, todavía tienes la cuenta activada. Vete a <a href="https://payment.genyus.tech/updateinfo/">este enlace</a> y actualiza tus datos del pago antes que se desactive tu cuenta.
<br><br>
¡Muchas gracias! 
`;
    const message = {
        subject: 'No hemos conseguido cobrar tu subscripción',
        html
    }
    await notification.sendMail(message, payload.customer.email, true)
    await notifyMoein(JSON.stringify(payload), 'Rebill failed');
}

async function handleSubscriptionCancelled(payload) {
    await notifyMoein(JSON.stringify(payload), 'Payment cancelled');
}

async function notifyMoein(subject, html) {
    await notification.sendMail({html, subject}, 'support@genyus.tech');
}

module.exports = thrivecart.webhook(async (req) => {
    const payload = req.body;
    if (payload.mode === 'test' && config.server.env === 'prod') {
        firebase.logger.warn('Received test mode in prod');
        return;
    }
    const thrivecartEvent = await firebase.firestore.collection('thrivecart_events').add({
        payload: req.body,
        creationTimestamp: firebase.firestoreNow,
    });
    switch (payload.event) {
        case 'order.success':
            await handleOrderSuccess(payload, thrivecartEvent.id);
            break;
        case 'order.rebill_failed':
            await handleRebillFailed(payload);
            break;
        case 'order.subscription_cancelled':
            await handleSubscriptionCancelled(payload);
            break;
        default:
            firebase.logger.warn(`Invalid event ${payload.event}`);
    }

});
