const mdlContasPagar = require("../model/mdlContasPagar");


// Listar todas as contas 
const getAllContasPagar = async (req, res) => {
    try {
        const contasPagar = await mdlContasPagar.getAllContasPagar();
        res.status(200).json(contasPagar);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar contas", details: error.message });
    }
};


// Buscar conta por ID 
const getContasPagarByID = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const conta = await mdlContasPagar.getContasPagarByID(id_contas);

        if (!conta) {
            return res.status(404).json({ error: "Conta não encontrada" });
        }

        res.status(200).json(conta);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar conta", details: error.message });
    }
};


// Criar nova conta 
const insertContasPagar = async (req, res) => {
    try {
        const dados = req.body;
        const novaConta = await mdlContasPagar.insertContasPagar(dados);
        res.status(201).json(novaConta);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar conta", details: error.message });
    }
};


// Atualizar conta 
const updateContasPagar = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const dados = req.body;
        const contaAtualizada = await mdlContasPagar.updateConstasPagar(id_contas, dados);

        if (!contaAtualizada) {
            return res.status(404).json({ error: "Conta não encontrada para atualizar" });
        }

        res.status(200).json(contaAtualizada);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar conta", details: error.message });
    }
};


// Deletar conta 
const deleteContasPagar = async (req, res) => {
    try {
        const { id_contas } = req.body;
        await mdlContasPagar.deleteContasPagar(id_contas);
        res.status(200).json({ message: "Conta deletada com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar conta", details: error.message });
    }
};


module.exports = {
    getAllContasPagar,
    getContasPagarByID,
    insertContasPagar,
    updateContasPagar,
    deleteContasPagar,
};
