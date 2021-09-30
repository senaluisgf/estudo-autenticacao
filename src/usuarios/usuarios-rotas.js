const usuariosControlador = require('./usuarios-controlador');
const middlewaresAutenticacao = require('./middlewares-autenticacao')
const tentarAutenticar = require('../middlewares/tentarAutenticar')
const tentarAutorizar = require('../middlewares/tentarAutorizar');
const autorizacao = require('../middlewares/autorizacao');

module.exports = app => {
  app.route('/usuario/atualiza_token')
    .post(middlewaresAutenticacao.refresh, usuariosControlador.login)

  app.route('/usuario/login')
    .post(middlewaresAutenticacao.local, usuariosControlador.login)

  app.route('/usuario/logout')
    .post(
      [middlewaresAutenticacao.refresh, middlewaresAutenticacao.bearer],
      usuariosControlador.logout
    )

  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(
      [tentarAutenticar, tentarAutorizar('usuario', 'ler')],
      usuariosControlador.lista);

  app
    .route('/usuario/verifica-email/:token')
    .get(
      middlewaresAutenticacao.verificacaoEmail,
      usuariosControlador.verificaEmail
    )

  app
    .route('/usuario/:id')
    .delete(
      [middlewaresAutenticacao.bearer, middlewaresAutenticacao.local, autorizacao('usuario', 'remover')],
      usuariosControlador.deleta);
};
