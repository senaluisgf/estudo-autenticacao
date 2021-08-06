const allowlistRefreshToken = require('../../redis/allowlist-refresh-token')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const moment = require('moment')

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

module.exports = {
    access: {
        tempoExpiracao: [15, 'm'],
        cria(id){
            const accessToken = criaTokenJWT(id, this.tempoExpiracao)
            return accessToken
        }
    },
    refresh: {
        tempoExpiracao: [5, 'd'],
        lista: allowlistRefreshToken,
        async cria(id){
            const refreshToken = await criaTokenOpaco(id, this.tempoExpiracao, this.lista)
            return refreshToken
        }
    },
}