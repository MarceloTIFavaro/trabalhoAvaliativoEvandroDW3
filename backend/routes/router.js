const express = require("express");
const routerApp = express.Router();

// Controllers
const appUsuario = require("../apps/usuario/controller/ctlUsuario");
const appContasPagar = require("../apps/contas_pagar/controller/ctlContasPagar");

// Middleware global (executa antes de todas as rotas)
routerApp.use((req, res, next) => {
  console.log('Requisição recebida: ${req.method} ${req.url}');
  next();
});

// --------------------
// ROTA PRINCIPAL
// --------------------
routerApp.get("/", (req, res) => {
  res.send("API rodando com sucesso!");
});

// --------------------
// ROTAS DE USUÁRIO
// --------------------
routerApp.get("/getAllUsuario", appUsuario.getAllUsuario);
routerApp.post("/getUsuarioByID", appUsuario.getUsuarioByID);
routerApp.post("/insertUsuario", appUsuario.insertUsuario);
routerApp.post("/updateUsuario", appUsuario.updateUsuario);
routerApp.post("/deleteUsuario", appUsuario.deleteUsuario);

// --------------------
// ROTAS DE CONTAS A PAGAR 
// --------------------
routerApp.get("/getAllContasPagar", appContasPagar.getAllContasPagar);
routerApp.post("/getContasPagarByID", appContasPagar.getContasPagarByID);
routerApp.post("/insertContasPagar", appContasPagar.insertContasPagar);
routerApp.post("/updateContasPagar", appContasPagar.updateContasPagar);
routerApp.post("/deleteContasPagar", appContasPagar.deleteContasPagar);


module.exports = routerApp;
