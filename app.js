const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser");

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./webii-d8ae7-firebase-adminsdk-jqzpe-1d9097acf2.json');

// Inicializa o Firebase
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// Configura o handlebars e registra o helper 'eq' diretamente na engine
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        eq: function(v1, v2) {
            return v1 === v2;
        }
    }
}));
app.set('view engine', 'handlebars');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rotas

// Rota inicial
app.get('/', function(req, res) {
    res.render('primeira_pagina');
});

// Rota para cadastrar dados
app.post('/cadastrar', function(req, res) {
    db.collection('Clientes').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function() {
        console.log('Dados cadastrados com sucesso!');
        res.redirect('/');
    }).catch(error => {
        console.error("Erro ao cadastrar:", error);
        res.status(500).send("Erro ao cadastrar dados");
    });
});

// Rota para consultar dados
app.get("/consultar", function(req, res) {
    const posts = [];
    db.collection('Clientes').get().then(function(snapshot) {
        snapshot.forEach(function(doc) {
            const data = doc.data();
            data.id = doc.id;
            posts.push(data);
        });
        res.render("consulta", { posts: posts });
        console.log('Dados consultados!');
    }).catch(error => {
        console.error("Erro ao consultar:", error);
        res.status(500).send("Erro ao consultar dados");
    });
});

// Rota para exibir a página de edição
app.get("/editar/:id", function(req, res) {
    const id = req.params.id;
    db.collection('Clientes').doc(id).get().then(function(doc) {
        if (doc.exists) {
            const data = doc.data();
            data.id = doc.id;
            res.render("editar", { post: data });
        } else {
            res.status(404).send("Documento não encontrado");
        }
    }).catch(error => {
        console.error("Erro ao buscar documento:", error);
        res.status(500).send("Erro ao buscar documento");
    });
});

// Rota para atualizar dados
app.post("/atualizar", function(req, res) {
    const id = req.body.id;
    db.collection('Clientes').doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function() {
        console.log('Documento atualizado com sucesso!');
        res.redirect('/consultar');
    }).catch(error => {
        console.error("Erro ao atualizar documento:", error);
        res.status(500).send("Erro ao atualizar documento");
    });
});

// Rota para excluir dados
app.get("/excluir/:id", function(req, res) {
    const id = req.params.id;
    db.collection('Clientes').doc(id).delete().then(function() {
        console.log('Documento excluído com sucesso!');
        res.redirect('/consultar');
    }).catch(error => {
        console.error("Erro ao excluir documento:", error);
        res.status(500).send("Erro ao excluir documento");
    });
});

// Inicia o servidor
app.listen(8081, function() {
    console.log('Servidor Ativo!');
});
