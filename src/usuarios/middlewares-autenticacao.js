const passport = require("passport")
const Usuario = require('../usuarios/usuarios-modelo')
const tokens = require("./tokens")

module.exports ={
    local: (req, res, next) => {
        passport.authenticate(
            'local',
            {session:false},
            (erro, usuario) => {
                if(erro) next(erro)
                
                req.user = usuario
                return next()
            }
        )(req, res, next)
    },
    bearer: (req, res, next) => {
        passport.authenticate(
            'bearer',
            {session:false},
            (erro, usuario, info) => {
                if(erro) next(erro)
                
                req.token = info.token
                req.user = usuario
                return next()
            }
        )(req,res,next)
    },
    refresh: async (req, res, next) => {
        try{
            const { refreshToken } = req.body
            const id = await tokens.refresh.verifica(refreshToken)
            await tokens.refresh.invalida(refreshToken)
            req.user = await Usuario.buscaPorId(id)
            return next()
        } catch(erro){
            next(erro)
        }
    },
    verificacaoEmail: async (req, res, next) => {
        try {
            const {token} = req.params
            const id = await tokens.verificacaoEmail.verifica(token)
            const usuario = await Usuario.buscaPorId(id)
            req.user = usuario
            next()
        } catch (erro) {
            next(erro)
        }
        
    }
}