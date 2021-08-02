const redis = require('redis')
const blocklist = redis.createClient({prefix: 'blocklist-access-token:'})
const manipulaLista = require('./manipula-lista')
const manipulaBlocklist = manipulaLista(blocklist)
const jwt = require('jsonwebtoken')
const { createHash } = require('crypto')

function criaTokenHash(token){
    return createHash('sha256').update(token).digest('hex')
}

module.exports = {
    adiciona: async token =>{
        const tokenHash = criaTokenHash(token)
        const tempoExpiracao = jwt.decode(token).exp
        await manipulaBlocklist.adiciona(tokenHash, '', tempoExpiracao)
    },
    contemToken: async token =>{
        const tokenHash = criaTokenHash(token)
        return manipulaBlocklist.contemChave(tokenHash)
    }
}