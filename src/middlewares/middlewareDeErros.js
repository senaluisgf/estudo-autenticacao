const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken')
const {InvalidArgumentError, InternalServerError} = require('../erros')

module.exports = (erro, req, res, next) => {
    let statusCode = 500
    const body = {
        mensagem: erro.message
    }

    if(erro instanceof InvalidArgumentError) statusCode = 401
    if(erro instanceof InternalServerError) statusCode = 500
    if(erro instanceof JsonWebTokenError) statusCode = 401
    
    if(erro instanceof TokenExpiredError){
        statusCode = 401
        body.expiradoEm = erro.expiredAt
    }

    res.status(statusCode)
    res.json(body)
    res.end()
}