const typeform = require('../service/typeform');
const notification = require('../service/notification');
const querystring = require('querystring');

module.exports = typeform.webhook(async (req, res) => {
    const answers = typeform.mapAnswers(req.body.form_response);
    const q = {
        'passthrough[customer_name]': answers.userName,
        'passthrough[customer_email]': answers.email,
        'passthrough[customer_company]': answers.shopName,
        'passthrough[customer_contactno]': answers.phone.replace('+', '00'),
    }
    const paymentUrl = `https://payment.genyus.tech/adriteayuda-basic/?${querystring.stringify(q)}`;
    const html = `¡Hola ${answers.userName}!
<br><br>
Muchas gracias por aceptar ser parte de AdriTeAyuda.
<br><br>
Aquí tienes el url del pago: <a href="${paymentUrl}">https://payment.genyus.tech/adriteayuda-basic</a>
<br><br>
Te en cuenta tendras una semana de prueba si eliges la opción mensual y 2 semanas si eliges las otras opciones.
<br><br>
¡Muchas gracias!`;

    await notification.sendMail({subject: 'Enlance de pago de AdriTeAyuda', html }, answers.email, true);
    res.send('');
});
