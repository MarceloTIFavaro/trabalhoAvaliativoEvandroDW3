var express = require('express'); // importa o framework Express
var router = express.Router(); //cria uma instancia do exprees para gerenciar as rotas do modulo parcelas
var parcelasApp = require("../apps/parcelas/controller/ctlParcelas"); // a variavel parcelasApp está recebendo as funções que estão dentro de ctlParcelas

//@ Função necessária para evitar que usuários não autenticados acessem o sistema.
function authenticationMiddleware(req, res, next) { // middleware função interna do express usado para para verificar, modificar ou bloquear requições. Parametros REQ(objeto da requisição, traz dados do usuario, cookies, sessão e etc), RES(Objeto da resposta, envia algo de volta ao cliente) e NEXT(função que passa a requisição adiante, ou seja, a rota)
  // Pega uma informação da sessão, no caso o valor da variavel isLogged que pode ser true(logado) ou false(não logado)
  isLogged = req.session.isLogged;

  // Se o usuario não estiver logado ele redireciona para a tela de login
  if (!isLogged) {
    return res.redirect("/Login");
  }

  // se estiver logado o middleware permite continuar 
  next();
}

/* POST - Listar parcelas de uma conta */
router.post('/listar', authenticationMiddleware, parcelasApp.ListarParcelas);
// Utilizando a instância do Express e o método POST, esta rota tem como objetivo listar as parcelas 
// relacionadas a uma conta específica.
// O caminho definido é "/listar".
// O middleware authenticationMiddleware é aplicado para garantir que apenas usuários autenticados 
// possam acessar a rota.
// Por fim, é executada a função parcelasApp.ListarParcelas, responsável por buscar no backend as parcelas 
// da conta informada e retornar os dados em formato JSON.

/* POST - Marcar parcela como paga */
router.post('/pagar', authenticationMiddleware, parcelasApp.PagarParcela);
// Esta rota utiliza o método POST para enviar ao servidor a informação de que uma determinada parcela foi paga.
// O caminho definido é "/pagar".
// O middleware authenticationMiddleware garante que somente usuários logados possam realizar esta operação.
// Por fim, é chamada a função parcelasApp.PagarParcela, que envia o ID da parcela ao backend para atualizar 
// seu status para "paga" e retorna uma mensagem de sucesso.

/* POST - Gerar parcelas para uma conta */
router.post('/gerar', authenticationMiddleware, parcelasApp.GerarParcelas);
// Aqui utilizamos o método POST para gerar automaticamente as parcelas de uma conta cadastrada.
// O caminho definido é "/gerar".
// O middleware authenticationMiddleware é aplicado para assegurar que o usuário esteja autenticado.
// Por fim, é executada a função parcelasApp.GerarParcelas, responsável por criar as parcelas no backend 
// com base nos dados fornecidos (como valor total, quantidade e vencimentos).

/* POST - Regerar (substituir) parcelas para uma conta */
router.post('/regerar', authenticationMiddleware, parcelasApp.RegerarParcelas);
// Esta rota utiliza o método POST para regerar (ou substituir) as parcelas de uma conta existente.
// O caminho definido é "/regerar".
// O middleware authenticationMiddleware impede que usuários não autenticados executem a ação.
// Por fim, é chamada a função parcelasApp.RegerarParcelas, que envia as informações ao backend 
// para excluir as parcelas antigas e gerar novas de acordo com os parâmetros atualizados.

module.exports = router;
// ele permite exportar para outros modulos o objeto router que contém as rotas
