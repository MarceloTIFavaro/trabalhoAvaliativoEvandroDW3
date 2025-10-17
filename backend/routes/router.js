const express = require("express");
const routerApp = express.Router();

// Controllers
const appUsuario = require("../apps/usuario/controller/ctlUsuario");

// Middleware global (executa antes de todas as rotas)
routerApp.use((req, res, next) => {
  console.log(`🛰️  Requisição recebida: ${req.method} ${req.url}`);
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
// const appContas = require("../apps/contas_a_pagar/controller/ctlContas");
// routerApp.get("/getAllContas", appContas.getAllContas);

module.exports = routerApp;
