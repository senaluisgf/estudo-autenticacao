const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const Usuario = require('./usuarios-modelo')
const { InvalidArgumentError } = require('../erros')

function verificaUsuario(usuario){
    if(!usuario){
        throw InvalidArgumentError('Email ou Senha estão incorretos')
    }
}

function verificaSenha(senha, senhaHash){
    const senhaValida = bcrypt.compare(senha, senhaHash)

    if(!senhaValida){
        throw new InvalidArgumentError("Email ou senha estão incorretos")
    }
}

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha',
        session: false
    }, (email, senha, done) => {
        try{
            const usuario = await Usuario.buscaPorEmail(email)
            verificaUsuario(usuario)
            verificaSenha(senha, usuario.senhaHash)

            done(null, usuario);
        } catch(error){
            done(error)
        }
    })
)