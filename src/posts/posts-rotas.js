const postsControlador = require('./posts-controlador');
const { bearer } = require('../usuarios/middlewares-autenticacao');

module.exports = app => {
  app
    .route('/post')
    .get(postsControlador.lista)
    .post(bearer,postsControlador.adiciona);
};
