const controle = require('../controleDeAcesso')

const metodos = {
    ler: {
        todos: 'readAny',
        apenasSeu: 'readOwn'
    },
    criar: {
        todos: 'createAny',
        apenasSeu: 'createOwn'
    },
    remover: {
        todos: 'deleteAny',
        apenasSeu: 'deleteOwn'
    }
}

module.exports = (entidade, acao) => (requisicao, resposta, proximo) => {
    const acoes = metodos[acao]
    const cargo = requisicao.user.cargo
    const permissoesTodos = controle.can(cargo)[acoes.todos](entidade)
    const permissoesApenasSeu = controle.can(cargo)[acoes.apenasSeu](entidade)

    if(!permissoesTodos.granted && !permissoesApenasSeu.granted){
        resposta.status(403).json({mensagem:'Acesso Negado'}).end()
        return
    }
    
    requisicao.acesso = {
        todos: {
            permitido: permissoesTodos.granted,
            atributos: permissoesTodos.attributes
        },
        apenasSeu: {
            permitido: permissoesApenasSeu.granted,
            atributos: permissoesApenasSeu.attributes
        }
    }

    proximo()
}