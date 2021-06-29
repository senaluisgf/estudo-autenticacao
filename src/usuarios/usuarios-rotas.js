const usuariosControlador = require('./usuarios-controlador');
const passport = require('passport')
const { local } = require('../usuarios/middlewares-autenticacao')

module.exports = app => {
  app.route('/usuario/login')
    .post(local, usuariosControlador.login)

  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app.route('/usuario/:id').delete(passport.authenticate('bearer',{session:false}), usuariosControlador.deleta);
};
