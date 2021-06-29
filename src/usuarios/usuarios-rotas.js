const usuariosControlador = require('./usuarios-controlador');
const { local, bearer } = require('../usuarios/middlewares-autenticacao')

module.exports = app => {
  app.route('/usuario/login')
    .post(local, usuariosControlador.login)

  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app.route('/usuario/:id').delete(bearer, usuariosControlador.deleta);
};
