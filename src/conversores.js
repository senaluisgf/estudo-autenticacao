class Conversor {
    converter(dados){
        if(this.camposPublicos.indexOf('*') === -1) dados = this.filtrar(dados)

        if(this.tipoDeConteudo === 'json') return this.json(dados)
    }

    filtrar(dados){
        if(Array.isArray(dados)){
            dados = dados.map(objeto => this.filtrarObjeto(objeto))
        } else {
            dados = this.filtrarObjeto(dados)
        }

        return dados
    }

    filtrarObjeto(objeto){
        const novoObjeto = {}
        this.camposPublicos.forEach(campo => {
            if(Reflect.has(objeto, campo)){
                novoObjeto[campo] = objeto[campo]
            }
        })

        return novoObjeto
    }

    json(dados){
        return JSON.stringify(dados)
    }
}

class ConversorDePost extends Conversor{
    constructor(tipoDeConteudo, camposExtras = []){
        super()
        this.tipoDeConteudo = tipoDeConteudo
        this.camposPublicos = ['titulo', 'conteudo']
        this.camposPublicos = this.camposPublicos.concat(camposExtras)
    }
}

class ConversorDeUsuario extends Conversor{
    constructor(tipoDeConteudo, camposExtras = []){
        super()
        this.tipoDeConteudo = tipoDeConteudo
        this.camposPublicos = ['nome']
        this.camposPublicos = this.camposPublicos.concat(camposExtras)
    }
}

module.exports =  { ConversorDePost, ConversorDeUsuario }