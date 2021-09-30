const Post = require('./posts-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');
const ConversorDePost = require('../conversores');

module.exports = {
  adiciona: async (req, res) => {
    try {
      const post = new Post(req.body);
      await post.adiciona();
      
      res.status(201).send(post);
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  lista: async (req, res) => {
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
      return res.status(500).json({ erro: erro });
    }
  }
};
