const blacklist = require('./blacklist')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const { createHash } = require('crypto')

const setAsync = promisify(blacklist.set).bind(blacklist)
const existAsync = promisify(blacklist.exists).bind(blacklist)

function criaTokenHash(token){
    return createHash('sha256').update(token).digest('hex')
}

module.exports = {
    adiciona: async token =>{
        const tokenHash = criaTokenHash(token)
        const tempoExpiracao = jwt.decode(token).exp
        await setAsync(tokenHash, '')
        blacklist.expireat(tokenHash, tempoExpiracao)

    },
    contemToken: async token =>{
        const tokenHash = criaTokenHash(token)
        const resultado = await existAsync(tokenHash)
        return resultado === 1
    }
}