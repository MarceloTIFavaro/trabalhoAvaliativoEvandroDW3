var express = require('express');
var router = express.Router();
var parcelasApp = require("../apps/parcelas/controller/ctlParcelas");

//@ Função necessária para evitar que usuários não autenticados acessem o sistema.
function authenticationMiddleware(req, res, next) {
  isLogged = req.session.isLogged;

  if (!isLogged) {
    return res.redirect("/Login");
  }

  next();
}

/* POST - Listar parcelas de uma conta */
router.post('/listar', authenticationMiddleware, parcelasApp.ListarParcelas);

/* POST - Marcar parcela como paga */
router.post('/pagar', authenticationMiddleware, parcelasApp.PagarParcela);

/* POST - Gerar parcelas para uma conta */
router.post('/gerar', authenticationMiddleware, parcelasApp.GerarParcelas);

/* POST - Regerar (substituir) parcelas para uma conta */
router.post('/regerar', authenticationMiddleware, parcelasApp.RegerarParcelas);

module.exports = router;

