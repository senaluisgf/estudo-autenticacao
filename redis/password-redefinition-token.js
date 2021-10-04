const redis = require('redis')
const manipulaLista =  require('./manipula-lista')
const passwordRedefinitionList = redis.createClient({prefix: 'password-redefinition-token'})

module.exports = manipulaLista(passwordRedefinitionList)