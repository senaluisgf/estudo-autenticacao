const nodemailer = require('nodemailer')

async function enviaEmail(usuario){
    const contaTeste = await nodemailer.createTestAccount()
    const transportador = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        auth: contaTeste
    })
    const info = await transportador.sendMail({
        from: '"Blog do Cógido" <noreply@blogdocodigo.com.br>',
        to: usuario.email,
        subject: 'Teste de email',
        text: 'Olá! email enviado',
        html: '<h1>Olá!</h1><p>Email enviado</p>'
    })
    const linkEmail = nodemailer.getTestMessageUrl(info)
    console.log(`URL: ${linkEmail}`)
}

module.exports = {
    enviaEmail
}