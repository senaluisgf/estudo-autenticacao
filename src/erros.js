class InvalidArgumentError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'InvalidArgumentError';
  }
}

class InternalServerError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'InternalServerError';
  }
}

class NaoEncontrado extends Error{
  constructor(entidade){
    const mensagem = `Não foi possível localizar ${entidade}`
    super(mensagem)
    this.name = "NaoEncontrado"
  }
}

module.exports = {
  InvalidArgumentError: InvalidArgumentError,
  InternalServerError: InternalServerError,
  NaoEncontrado: NaoEncontrado
};
