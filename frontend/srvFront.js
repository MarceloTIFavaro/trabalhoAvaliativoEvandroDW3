var createError = require('http-errors');
var nunjucks = require("nunjucks");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');

// Carrega variáveis de ambiente
const envFilePath = path.resolve(__dirname, './srvFront.env');
require('dotenv').config({ path: envFilePath });

const port = process.env.PORT || 3000;

// Importa as rotas
var rtIndex = require('./routes/rtIndex');
var rtContasPagar = require('./routes/rtContasPagar');
var rtParcelas = require('./routes/rtParcelas');

jwtchave = process.env.JWTCHAVE;

var app = express();

// Configura o Nunjucks como template engine
nunjucks.configure('apps', {
    autoescape: true,
    express: app,
    watch: true
});

// Serve arquivos estáticos
app.use(express.static(__dirname));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWTCHAVE, 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: null },
  })
);

// Define as rotas
app.use('/', rtIndex);
app.use('/contaspagar', rtContasPagar);
app.use('/parcelas', rtParcelas);

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Frontend rodando em http://localhost:${port}`);
  console.log(`📊 Backend configurado para: ${process.env.SERVIDOR_BACKEND}`);
});

module.exports = app;

