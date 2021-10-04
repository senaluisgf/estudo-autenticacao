const nodemailer = require('nodemailer')

const configuracaoEmailTeste = (contaTeste) => ({
    host: 'smtp.ethereal.email',
    auth: contaTeste
})

const configuracaoEmailProducao = {
    host: process.env.EMAIL_HOST,
    auth: {
        user: process.env.EMAIL_USUARIO,
        pass: process.env.EMAIL_SENHA
    },
    secure: true
}

async function criaConfiguracaoEmail(){
    if(process.env.NODE_ENV === 'production'){
        return configuracaoEmailProducao
    } else {
        const contaTeste = await nodemailer.createTestAccount()
        return configuracaoEmailTeste(contaTeste)
    }
}

class Email{
    async enviaEmail(){
        const confifuracaoEmail = await criaConfiguracaoEmail()
        const transportador = nodemailer.createTransport(confifuracaoEmail)

        const info = await transportador.sendMail(this)

        if(process.env.NODE_ENV !== 'production'){
            const linkEmail = nodemailer.getTestMessageUrl(info)
            console.log(`URL: ${linkEmail}`)
        }
        
    }
}

class EmailVerificacao extends Email{
    constructor(usuario, endereco){
        super()
        this.from = '"Blog do Cógido" <noreply@blogdocodigo.com.br>'
        this.to = usuario.email
        this.subject = 'Verificação de email'
        this.text = `Olá! verifique seu email aqui: ${endereco}`
        this.html = `<h1>Olá!</h1> verifique seu email aqui: <a href=${endereco}>${endereco}<a/>`
    }
}

class EmailRedefinicao extends Email{
    constructor(usuario){
        super()
        this.from = '"Blog do Cógido" <noreply@blogdocodigo.com.br>'
        this.to = usuario.email
        this.subject = 'Redefinição de senha'
        this.text = `Olá! você solicitou redefinição de senha`
        this.html = `<h1>Olá!</h1> você solicitou redefinição de senha`
    }
}

module.exports = {
    Email,
    EmailVerificacao,
    EmailRedefinicao
}