const allowlistRefreshToken = require('../../redis/allowlist-refresh-token')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const moment = require('moment')
const blocklistAccessToken = require('../../redis/blocklist-access-token')
const {InvalidArgumentError} = require('../erros')
const passwordRedefinitionList = require('../../redis/password-redefinition-token')

function criaTokenJWT(id, tempoExpiracao){
    const payload = { id }
    let token
    if(tempoExpiracao){
        const [tempoQuantidade, tempoUnidade] = tempoExpiracao

        token = jwt.sign(
            payload,
            process.env.CHAVE_JWT,
            { expiresIn: tempoQuantidade+tempoUnidade }
        )
    } else {
        token = jwt.sign(
            payload,
            process.env.CHAVE_JWT
        )
    }
    
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

async function invalidaAccessToken(token, blocklist){
    await blocklist.adiciona(token)
}

async function invalidaRefreshToken(token, allowlist){
    await allowlist.deletaValor(token)
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
        },
        async invalida(token){
            return await invalidaAccessToken(token, this.lista)
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
        },
        async invalida(token){
            return await invalidaRefreshToken(token, this.lista)
        }
    },
    verificacaoEmail: {
        tempoExpiracao: [1, 'h'],
        nome: 'email validation token',
        async cria(id){
            const emailValidationToken = criaTokenJWT(id, this.tempoExpiracao)
            return emailValidationToken;
        },
        async verifica(token){
            const { id } = jwt.verify(token, process.env. CHAVE_JWT)
            return id
        },
    },
    redefinicaoSenha: {
        tempoExpiracao: [1, 'h'],
        lista: passwordRedefinitionList,
        nome: 'email password redefinition',
        async cria(id){
            const passwordRedefinitionToken = await criaTokenOpaco(id, this.tempoExpiracao, this.lista)
            return passwordRedefinitionToken;
        },
        async verifica(token){
            const id = await verificaRefreshToken(token, this.nome, this.lista)
            return id
        },
        async invalida(token){
            return await invalidaRefreshToken(token, this.lista)
        }
    }
}