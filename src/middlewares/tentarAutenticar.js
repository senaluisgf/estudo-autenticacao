const middlewaresAutenticacao = require('../usuarios/middlewares-autenticacao')

module.exports = (req, res, next) => {
    if(req.get('Authorization')){
        return middlewaresAutenticacao.bearer(req, res, next)
    }

    next()
}