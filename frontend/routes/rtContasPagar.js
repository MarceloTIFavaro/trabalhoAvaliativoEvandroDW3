var express = require('express'); // importa o framework Express
var router = express.Router(); //cria uma instancia do exprees para gerenciar as rotas do modulo contas a pagar 
var contasPagarApp = require("../apps/contas_pagar/controller/ctlContasPagar"); // a variavel contasPagarApp está recebendo as funções que estão dentro de ctlContasPagar

//@ Função necessária para evitar que usuários não autenticados acessem o sistema.
function authenticationMiddleware(req, res, next) { // middleware função interna do express usado para para verificar, modificar ou bloquear requições. Parametros REQ(objeto da requisição, traz dados do usuario, cookies, sessão e etc), RES(Objeto da resposta, envia algo de volta ao cliente) e NEXT(função que passa a requisição adiante, ou seja, a rota)
  isLogged = req.session.isLogged; // Pega uma informação da sessão, no caso o valor da variavel isLogged que pode ser true(logado) ou false(não logado)

  // Se o usuario não estiver logado ele redireciona para a tela de login
  if (!isLogged) {
    return res.redirect("/Login");
  }

  // se estiver logado o middleware permite continuar 
  next();
}

/* GET - Página de gerenciamento de contas */
router.get('/gerenciar', authenticationMiddleware, contasPagarApp.GerenciarContas); 
// Utilizando a instância do Express e a função GET, esta rota será acessada para buscar ou exibir uma página,
// dependendo da função que está sendo chamada. 
// O caminho definido é "/gerenciar". 
// O middleware authenticationMiddleware é aplicado para garantir que o usuário esteja logado.
// Por fim, é executada a função contasPagarApp.GerenciarContas, que neste caso renderiza a página de gerenciamento.

/* POST - Criar nova conta */
router.post('/criar', authenticationMiddleware, contasPagarApp.CriarConta);
// Aqui utilizamos a instância do Express e o método POST, que é usado para enviar dados ao servidor.
// O caminho definido é "/criar".
// O middleware authenticationMiddleware é aplicado para verificar se o usuário está autenticado.
// Por fim, é executada a função contasPagarApp.CriarConta, responsável por criar uma nova conta no sistema,
// enviando os dados para o backend e retornando uma resposta em JSON.

/* POST - Atualizar conta */
router.post('/atualizar', authenticationMiddleware, contasPagarApp.AtualizarConta);
// Esta rota utiliza o método POST para enviar informações que atualizam uma conta existente.
// O caminho da rota é "/atualizar".
// O middleware authenticationMiddleware garante que apenas usuários logados possam realizar a ação.
// Por fim, é chamada a função contasPagarApp.AtualizarConta, que envia os novos dados da conta ao backend,
// atualizando as informações no banco de dados e retornando o status da operação.

/* POST - Deletar cocomnta */
router.post('/deletar', authenticationMiddleware, contasPagarApp.DeletarConta);
// Nesta rota utilizamos o método POST para excluir uma conta específica.
// O caminho definido é "/deletar".
// O middleware authenticationMiddleware impede o acesso de usuários não autenticados.
// Por fim, é executada a função contasPagarApp.DeletarConta, que envia o ID da conta ao backend
// e realiza a exclusão da conta, retornando uma resposta em JSON.

/* GET - Buscar contas do usuário */
router.get('/listar', authenticationMiddleware, contasPagarApp.ListarContas);
// Aqui utilizamos o método GET, pois o objetivo é buscar informações (listar contas).
// O caminho da rota é "/listar".
// O middleware authenticationMiddleware é usado para verificar se o usuário está logado.
// Por fim, é chamada a função contasPagarApp.ListarContas, que faz uma requisição ao backend
// para obter todas as contas do usuário logado e retorna os dados em formato JSON.

/* POST - Marcar conta como paga */
router.post('/pagar', authenticationMiddleware, contasPagarApp.PagarConta);
// Esta rota usa o método POST para enviar uma requisição ao servidor informando que uma conta foi paga.
// O caminho definido é "/pagar".
// O middleware authenticationMiddleware garante que o usuário esteja autenticado antes da operação.
// Por fim, a função contasPagarApp.PagarConta é executada, enviando o ID da conta ao backend
// para atualizar seu status para "paga" e retornando uma mensagem de sucesso.

module.exports = router;
// ele permite exportar para outros modulos o objeto router que contém as rotas
