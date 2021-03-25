const firebase = require('../service/firebase');
const notification = require('../service/notification');
const config = require('../../config');

module.exports = firebase.httpFunction.onRequest(async (req, res) => {
   const email = req.body.email;
   if (!email) {
      return res.status(400).send('Missing email');
   }

   const customerHub = config.thrivecart.customerHub;
   const template = `¡Hola!
<br><br>
Te escribimos para recordarte que mañana se acaba el periodo de prueba de AdriTeAyuda.
<br><br>
Si quieres cancelar tu supscripción lo puedes hacer aquī: %link%
<br><br>
¡Muchas gracias!`;

   const html = template
       .replace(/%link%/g, `<a href="${customerHub}">${customerHub}</a>`)
   const text = template
       .replace(/%link%/g, customerHub)
       .replace(/<br><br>/g, '')

   await notification.sendMail({subject: 'Que tal tu periodo de prueba con AdriTeAyuda?', html, text }, email, true);
   res.send('');
});
