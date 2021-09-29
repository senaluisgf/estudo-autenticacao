module.exports = (cargosObrigatorios) => (requisicao, resposta, proximo) => {
    
    if(cargosObrigatorios.indexOf(requisicao.user.cargo) === -1){
        console.log("rota bloqueada")
        resposta.status(403).json({mensagem:'Acesso Negado'})
    }

    proximo()
}