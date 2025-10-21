var express = require('express');
var router = express.Router();
var contasPagarApp = require("../apps/contas_pagar/controller/ctlContasPagar");

//@ Função necessária para evitar que usuários não autenticados acessem o sistema.
function authenticationMiddleware(req, res, next) {
  isLogged = req.session.isLogged;

  if (!isLogged) {
    return res.redirect("/Login");
  }

  next();
}

/* GET - Página de gerenciamento de contas */
router.get('/gerenciar', authenticationMiddleware, contasPagarApp.GerenciarContas);

/* POST - Criar nova conta */
router.post('/criar', authenticationMiddleware, contasPagarApp.CriarConta);

/* POST - Atualizar conta */
router.post('/atualizar', authenticationMiddleware, contasPagarApp.AtualizarConta);

/* POST - Deletar conta */
router.post('/deletar', authenticationMiddleware, contasPagarApp.DeletarConta);

/* GET - Buscar contas do usuário */
router.get('/listar', authenticationMiddleware, contasPagarApp.ListarContas);

/* POST - Marcar conta como paga */
router.post('/pagar', authenticationMiddleware, contasPagarApp.PagarConta);

module.exports = router;

