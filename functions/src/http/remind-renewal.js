const firebase = require('../service/firebase');
const notification = require('../service/notification');
const config = require('../../config');

module.exports = firebase.httpFunction.onRequest(async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send('Missing email');
    }

    const customerHub = config.thrivecart.customerHub;
    const html = `¡Hola!
<br><br>
Te escribimos para recordarte que mañana se acaba el periodo de prueba de AdriTeAyuda.
<br><br>
Si quieres cancelar tu supscripción lo puedes hacer aquī: <a href="${customerHub}">${customerHub}</a>
<br><br>
¡Muchas gracias!`;
    await notification.sendMail({subject: 'Que tal tu periodo de prueba con AdriTeAyuda?', html }, email, true);
    res.send('');
});
