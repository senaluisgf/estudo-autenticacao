const Post = require('./posts-modelo');
const {ConversorDePost} = require('../conversores');

module.exports = {
  adiciona: async (req, res, next) => {
    try {
      const post = new Post(req.body);
      await post.adiciona();
      
      res.status(201).send(post);
    } catch (erro) {
      next(erro)
    }
  },

  lista: async (req, res, next) => {
    try {
      let posts = await Post.lista();
      const camposExtras = req.acesso?.todos.permitido
        ? req.acesso.todos.atributos
        : req.acesso?.apenasSeu.atributos

      const conversor = new ConversorDePost('json', camposExtras)


      if(!req.user){
        posts = posts.map(post => ({
          titulo: post.titulo,
          conteudo: post.conteudo.substr(0, 10) + "... Inscreva-se para ver o conteúdo completo!"
        }))
      }

      res.send(conversor.converter(posts));
    } catch (erro) {
      next(erro)
    }
  }
};
