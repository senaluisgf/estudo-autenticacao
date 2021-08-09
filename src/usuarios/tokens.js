const allowlistRefreshToken = require('../../redis/allowlist-refresh-token')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const moment = require('moment')
const blocklistAccessToken = require('../../redis/blocklist-access-token')
const {InvalidArgumentError} = require('../erros')

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]){
    const payload = { id }
    const token = jwt.sign(
        payload,
        process.env.CHAVE_JWT,
        { expiresIn: tempoQuantidade+tempoUnidade }
        )
    return token
}
  
async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], allowlist){
    const tokenOpaco = crypto.randomBytes(24).toString('hex')
    const dataExpiracao = moment().add(tempoQuantidade, tempoUnidade).unix()
    await allowlist.adiciona(tokenOpaco, id, dataExpiracao)

    return tokenOpaco
}

async function verificaAccessToken(token, nome, blocklist){
    const estaNaBlocklist = await blocklist.contemToken(token)
    if(estaNaBlocklist){
        throw new jwt.JsonWebTokenError(`${nome} invalidado por Logout`)
    }
}

async function verificaRefreshToken(token, nome, allowlist){
    if(!token){
        throw new InvalidArgumentError(`nao passou o ${nome}`)
    }
    const id = await allowlist.buscaValor(token)
    if(!id){
        throw new InvalidArgumentError(`${nome} invalido`)
    }
    return id
}

module.exports = {
    access: {
        lista: blocklistAccessToken,
        tempoExpiracao: [15, 'm'],
        nome: 'access token',
        cria(id){
            const accessToken = criaTokenJWT(id, this.tempoExpiracao)
            return accessToken
        },
        async verifica(token){
            await verificaAccessToken(token, this.nome, this.lista)
            const { id } = jwt.verify(token, process.env.CHAVE_JWT)
            return id
        }
    },
    refresh: {
        tempoExpiracao: [5, 'd'],
        lista: allowlistRefreshToken,
        nome: 'refresh token',
        async cria(id){
            const refreshToken = await criaTokenOpaco(id, this.tempoExpiracao, this.lista)
            return refreshToken
        },
        async verifica(token){
            return await verificaRefreshToken(token, this.nome, this.lista)
        }
    },
}