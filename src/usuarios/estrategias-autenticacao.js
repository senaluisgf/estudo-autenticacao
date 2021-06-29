const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const BearerStrategy =  require('passport-http-bearer')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Usuario = require('./usuarios-modelo')
const { InvalidArgumentError } = require('../erros')

function verificaUsuario(usuario){
    if(!usuario){
        throw new InvalidArgumentError('Email ou Senha estão incorretos')
    }
}

async function verificaSenha(senha, senhaHash){
    const senhaValida = await bcrypt.compare(senha, senhaHash)

    if(!senhaValida){
        throw new InvalidArgumentError("Email ou senha estão incorretos")
    }
}

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha',
        session: false
    }, async (email, senha, done) => {
        try{
            const usuario = await Usuario.buscaPorEmail(email)
            verificaUsuario(usuario)
            await verificaSenha(senha, usuario.senhaHash)

            done(null, usuario);
        } catch(error){
            done(error)
        }
    })
)

passport.use(
    new BearerStrategy(
        async (token, done) => {
            try{
                const payload = jwt.verify(token, process.env.CHAVE_JWT)
                const usuario = await Usuario.buscaPorId(payload.id)
                done(null, usuario)
            }catch(error){
                done(error)
            }
        }
    )
)