var express = require('express');
var router = express.Router();
var loginApp = require("../apps/login/controller/ctlLogin");
var usuarioApp = require("../apps/usuario/controller/ctlUsuario");

//@ Função necessária para evitar que usuários não autenticados acessem o sistema.
function authenticationMiddleware(req, res, next) {
  //@ Verificar se existe uma sessão válida
  isLogged = req.session.isLogged;

  if (!isLogged) {
    return res.redirect("/Login");
  }

  next();
}

/* GET home page - Dashboard */
router.get('/', authenticationMiddleware, function (req, res, next) {
  userName = req.session.userName;
  userType = req.session.userType;
  userId = req.session.userId;
  
  parametros = { 
    title: 'Dashboard - Contas a Pagar', 
    Usuario: userName,
    TipoUsuario: userType,
    IdUsuario: userId
  };

  res.render('home/view/index.njk', { parametros });
});

/* GET login page */
router.get('/Login', loginApp.Login);

/* POST login page */
router.post('/Login', loginApp.Login);

/* GET logout page */
router.get('/Logout', loginApp.Logout);

/* POST cadastro direto do login */
router.post('/Cadastro', usuarioApp.CadastroPost);

module.exports = router;

