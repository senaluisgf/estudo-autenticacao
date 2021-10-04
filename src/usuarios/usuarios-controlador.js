const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, NaoEncontrado } = require('../erros');

const tokens = require('./tokens');
const { EmailVerificacao, EmailRedefinicao } = require('./emails');
const { ConversorDeUsuario } = require('../conversores');
const { buscaPorEmail } = require('./usuarios-modelo');

function geraEndereco(rota, id){
  const baseURL = process.env.BASE_URL
  const endereco = `${baseURL}${rota}${id}`
  return endereco
}

module.exports = {
  adiciona: async (req, res, next) => {
    const { nome, email, senha, cargo } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false,
        cargo,
      });

      await usuario.adicionaSenha(senha)
      await usuario.adiciona();
      
      const emailValidationToken = await tokens.verificacaoEmail.cria(usuario.id)

      const endereco = geraEndereco('/usuario/verifica-email/', emailValidationToken)
      const emailVerificacao = new EmailVerificacao(usuario, endereco)
      emailVerificacao.enviaEmail()

      res.status(201).json();
    } catch (erro) {
      next(erro)
    }
  },
  
  login: async (req, res)=>{
    const acessToken = tokens.access.cria(req.user.id)
    const refreshToken = await tokens.refresh.cria(req.user.id)
    res.set('Authorization', acessToken)
    res.status(200).json({ refreshToken })
  },
  
  logout: async (req, res, next) => {
    try{
      const token = req.token
      await tokens.access.invalida(token)
      res.status(204).send()
    } catch(erro){
      next(erro)
    }
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    const camposExtras = req.acesso?.todos.permitido
      ? req.acesso.todos.atributos
      : req.acesso?.apenasSeu.atributos

    const conversor = new ConversorDeUsuario('json', camposExtras)
    res.send(conversor.converter(usuarios));
  },

  verificaEmail: async (req, res, next) => {
    try{
      const usuario = req.user
      await usuario.verificaEmail()
      res.status(200).json()
    } catch(erro){
      next(erro)
    }
  },

  deleta: async (req, res, next) => {
    try {
      const usuario = await Usuario.buscaPorId(req.params.id);
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      next(erro)
    }
  },

  esqueciMinhaSenha: async (req, res, next) => {
    const respostaPadrao = { mensagem: 'Assim que localizarmos o email enviaremos instruções para redefinição de senha'}
    try{
      const { email } = req.body

      if(!email) throw new InvalidArgumentError("campo email é obrigatório")

      const usuario = await buscaPorEmail(email)

      const emailRedefinicao = new EmailRedefinicao(usuario)
      emailRedefinicao.enviaEmail()

      res.status(201).json(respostaPadrao)
    } catch(erro){
      console.log(erro)
      if(erro instanceof NaoEncontrado){
        res.json(respostaPadrao)
        return
      }
      next(erro)
    }
  }
};
