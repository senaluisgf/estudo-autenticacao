const postsControlador = require('./posts-controlador');
const { middlewaresAutenticacao } = require('../usuarios');
const autorizacao = require('../middlewares/autorizacao');

module.exports = app => {
  app
    .route('/post')
    .get(
      [middlewaresAutenticacao.bearer, autorizacao(['assinante'])],
      postsControlador.lista)
    .post(middlewaresAutenticacao.bearer,postsControlador.adiciona);
};
