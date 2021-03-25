const crypto = require('crypto');
const firebase = require('../service/firebase');
const notification = require('../service/notification');

module.exports = {
    create: async (email, userName, companyName, phone) => {
        const user = await firebase.auth.createUser({
            email: email,
            emailVerified: false,
            password: crypto.randomBytes(48).toString('base64'),
            displayName: userName,
            disabled: false,
        });
        const userId = user.uid;
        const account = await firebase.firestore.collection('accounts').add({
            name: companyName,
            responsibleId: userId,
            creationTimestamp: firebase.firestoreNow,
        })
        const shop = await firebase.firestore.collection('shops').add({
            name: companyName,
            phone: phone,
            accountId: account.id,
            creationTimestamp: firebase.firestoreNow,
        });
        await firebase.firestore.collection('profiles').doc(userId).set({
            name: userName,
            accountId: account.id
        });
        await firebase.firestore
            .collection('shop_members')
            .doc(`${shop.id}-${userId}`)
            .set({
                role: 'owner',
                shopId: shop.id,
                userId
            });
        const template = `¡Hola ${userName}!
<br><br>
Muchas gracias por aceptar ser parte de AdriTeAyuda.
<br><br>
Acabo de crear tu cuenta en la aplicación y puedes entrar y empezar a usarlo.
<br><br>
Para entrar simplemente entra en %web_link% e introduce tu correo pulsa el botón Entrar. Después vas a recibir un correo electrónico con un enlace de acceso y entrando en ese enlace ya puedes a empezar a usar la aplicación.
<br><br>
¡Muchas gracias y espero que disfrutes de AdriTeAyuda!`;

        const html = template
            .replace(/%web_link%/g, '<a href="https://adriteayuda.es">adriteayuda.es</a>')
        const text = template
            .replace(/%web_link%/g, 'https://adriteayuda.es')
        await notification.sendMail({subject: 'Bienvenid@ a AdriTeAyuda', html, text }, email, true);
        return {userId, shopId: shop.id, accountId: account.id};
    }
};
