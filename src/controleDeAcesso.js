const AccessControl = require('accesscontrol')
const controle = new AccessControl()

controle.grant('assinante')
    .readAny('post')

controle.grant('editor')
    .extend('assinante')
    .createOwn('post')
    .deleteOwn('post')

controle.grant('admin')
    .readAny('post')
    .createAny('post')
    .deleteAny('post')
    .readAny('usuario')
    .createAny('usuario')
    .deleteAny('usuario')

module.exports = controle