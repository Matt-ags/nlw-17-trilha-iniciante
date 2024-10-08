const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require("fs").promises

let mensagem = "Bem vindo(a) ao app de metas";

///abaixo é pra testar:

let metas


//verificar esta parte de carregar metas::
const carregarMetas = async () => {
    try{
        const dados = await fs.readFile("metas.json", "utf-8")
        metas = JSON.parse(dados)
    }
    catch{erro} {
        metas = []
    }
}

const salvarMetas = async() => {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async() => {

    const meta = await input({ message: "Digite a meta:" }) 
    //mesma coisa que o select, chamou na pasta, e espera agora o usuário colocar algo
    //uso do legth fala se tem mais de um caractere! tipo, confirmar se o usuário colocou algo
    if(meta.length == 0) {
        mensagem = "A meta não pode ser vazia!"
        return
    }

    //tendo algo, ele puxa pra metas (o array) o valor da meta, e lá depois, ele moctra as metas cadastradas.

    metas.push(
        {value: meta, checked: false}
    )

    mensagem = "Meta cadastrada com sucesso!"

}

const listarMetas = async() => {

    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }

    const respostas = await checkbox({
        message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar, e o enter para finalizar esta etapa.",
        choices: [...metas], //cara isso é legal, ele meio que joga os valores da metas, com esses tres pontinhos, pois meio que fica mudando certo? por isso ele joga o que tem aqui!
        instructions: false,
    })

    metas.forEach((m) =>{
        m.checked = false
    })

    //para resolver o bug do metas, basicamente sõ coloquei o metas.foreath antes de verificar se há uma meta realizada!

    if(respostas.length == 0) {
        mensagem = "Nenhuma meta selecionada!"
        return
    }

    //isso abaixo desmarca todas as metas, mas lembra que logfo abaixo colocou que as selecionadas "pemanecem selecionadas?" então ele desmarca as desmarcadsas em resumo, para não dar erro.


    
    //para cada resposta:
    respostas.forEach((resposta) => {
        const meta = metas.find((m) => {
            return m.value == resposta 
        })
            //meio que ele ta fazendo assim, pra cada meta selecionada, ele guardou, e compara, tipo, tem duas medas, andar e correr, e selecionei correr, ele vai e compara a cada meta selecionada com as medas, tipo, correr é igual a andasr, não, volta pra la, andar é igual a andar, sim, dai ele troca o checked para veradeiro!
        meta.checked = true
    })

    mensagem = "Meta(s) marcada(s) como concluída(s)!"
}

const metasRealizadas = async() => {

    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }

    const realizadas = metas.filter((meta) => {
        return meta.checked
    })

    if(realizadas.length == 0){
        mensagem = "Não existem metas realizadas! D:" 
        return
    }

    await select({
        message: "Metas realizadas: " + realizadas.length,
        choices: [...realizadas]
    })

    //basicamente fazendo uma listinha das realizadas

    // console.log(realizadas)
    //esse filter é uma "HOF", ele sempre recebe uma função
}

const metasAbertas = async() => {

    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }

    const abertas = metas.filter((meta) => {
        return meta.checked != true
        //lembra que etsa fun~]ao só recebe um valor que seja verdadeiro, ou seja, metaschecked é diferente de verdadeiiro? ou seja, ele vai ver cada meta, seu checked, se for verdadeiro, pula, se for falso, que é diferente de verdadeiro, ele retoma
    })

    if(abertas.length == 0){
        mensagem = "Não existem metas abertas! :D"
        return
    }

    await select ({
        message: "Metas abertas: " + abertas.length,
        choices: [...abertas]

    })

}

const deletarMetas = async() => {

    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }
    
    const metasDesmarcadas = metas.map((meta) => {
        // o map altera de qualquer forma o array original!
        return {value: meta.value, checked: false}

    })

    const itensADeletar = await checkbox({
        message: "Selecione um item para deletar",
        choices: [...metasDesmarcadas], //cara isso é legal, ele meio que joga os valores da metas, com esses tres pontinhos, pois meio que fica mudando certo? por isso ele joga o que tem aqui!
        instructions: false,
    })

    if(itensADeletar.length == 0){
        mensagem = "Nenhum item para deletar!"
        return
    }

    itensADeletar.forEach((item) => {
        metas = metas.filter((meta) => {
            return meta.value != item
            //só vai ficar na lista de metas aquilo não marcado

        })
    })

    mensagem = "Meta(s) deletada(s) com sucesso!"
}

const mostrarMensagem = () => {
    console.clear();

    if(mensagem != ""){
        console.log(mensagem)
        console.log(" ")
        mensagem = ""
    }
}
const start = async() => {

    await carregarMetas()

    while(true){
        mostrarMensagem()
        await salvarMetas()

        //esse await (pra funcionar, tenha o async na função) fala pro js, "espera, o usuário vai selecionar algo!"

        const opcao = await select ({
            message: "Menu >",
            choices: [
                //nome do value tem que ser identico com o do case!

                {
                    name: "Cadastrar meta",
                    value: "cadastrar",
                },

                {
                    name: "Listar metas",
                    value: "listar"
                },

                {
                    name: "Metas realizadas",
                    value: "realizadas"
                },

                {
                    name: "Metas abertas",
                    value: "abertas"
                },

                {
                    name: "Deletar metas",
                    value: "deletar"
                },

                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })

        ///como está funcionando? Imagine o seguinte, a gente pegou o módulo do select, e esperou o usuário selecionar algo, se ele selecionou por exemplo cadastrar, opcao troca por cadastrar, e vai pro swith case, no cadastrar tem o caso de cadastrar, ele fasz o que tem, que fazer, terminando, volta no menu, e assim por diante. 

        // alterando a opcao com algum item abaixo, ele faz certa ação, mas toma cuidado que neste estado, se eu colocar em um, elke faz infinitamente:

        switch(opcao){
            case "cadastrar":
                await cadastrarMeta()
                ///importante o uso este await!
                break
            
            case "listar":
                await listarMetas()
                break

            case "realizadas":
                await metasRealizadas()
                break

            case "abertas":
                await metasAbertas()
                break

            case "deletar":
                await deletarMetas()
                break
            
            case "sair":
                console.log("Asta la vista, baby!")
                return
    }
}

}

start()

