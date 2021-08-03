const passport = require("passport")
const { InvalidArgumentError } = require("../erros")
const Usuario = require('../usuarios/usuarios-modelo')
const allowlist = require('../../redis/allowlist-refresh-token')

async function verificaRefreshToken(refreshToken) {
    if(!refreshToken){
        throw new InvalidArgumentError("nao passou o refresh token")
    }
    const id = await allowlist.buscaValor(refreshToken)
    if(!id){
        throw new InvalidArgumentError('Refresh Token invalido')
    }
    return id
}

async function invalidaRefreshToken(refreshToken){
    await allowlist.deletaValor(refreshToken)
}

module.exports ={
    local: (req, res, next) => {
        passport.authenticate(
            'local',
            {session:false},
            (erro, usuario, info) => {
                if(erro && erro.name == 'InvalidArgumentError'){
                    return res.status(401).json({erro: erro.message})
                }
                
                if(erro){
                    return res.status(500).json({erro: erro.message})
                }
                
                if(!usuario){
                    return res.status(401).json()
                }
                
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
                if(erro && erro.name === 'JsonWebTokenError'){
                    return res.status(401).json({erro: erro.message})
                }

                if(erro && erro.name === 'TokenExpiredError'){
                    return res.status(401).json({erro: erro.message, expiradoEm: erro.expiredAt})
                }

                if(erro){
                    return res.status(500).json({erro: erro.message})
                }

                if(!usuario){
                    return res.status(401).json()
                }
                
                req.token = info.token
                req.user = usuario
                return next()
            }
        )(req,res,next)
    },
    refresh: async (req, res, next) => {
        try{
            const { refreshToken } = req.body
            const id = await verificaRefreshToken(refreshToken)
            await invalidaRefreshToken(refreshToken)
            req.user = await Usuario.buscaPorId(id)
            return next()
        } catch(erro){
            if(erro.name === "InvalidArgumentError"){
                return res.status(401).json({erro: erro.message})
            }

            return res.status(500).json({erro: erro.message})
        }
    }
}