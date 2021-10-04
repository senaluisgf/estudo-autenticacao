const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, NaoEncontrado } = require('../erros');

const tokens = require('./tokens');
const { EmailVerificacao, EmailRedefinicao } = require('./emails');
const { ConversorDeUsuario } = require('../conversores');
const { buscaPorEmail, buscaPorId } = require('./usuarios-modelo');

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
      
      const token = await tokens.redefinicaoSenha.cria(usuario.id)
      const emailRedefinicao = new EmailRedefinicao(usuario, token)
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
  },

  redefinirSenha: async (req, res, next) => {
    try {
      const { token, senha, confirmar } = req.body

      if(!token) throw new InvalidArgumentError('Token must be provided!')
      if(!senha) throw new InvalidArgumentError('Senha must be provided!')
      if(!confirmar) throw new InvalidArgumentError('Confirmar must be provided!')
      if(senha !== confirmar) throw new InvalidArgumentError("Senha and Confirmar must be equals")

      const id = await tokens.redefinicaoSenha.verifica(token)
      const usuario = await buscaPorId(id)

      await usuario.adicionaSenha(senha)

      await usuario.redefinirSenha()

      await tokens.redefinicaoSenha.invalida(token)

      res.status(201).json()

    }catch(erro){
      next(erro)
    }
  }
};
