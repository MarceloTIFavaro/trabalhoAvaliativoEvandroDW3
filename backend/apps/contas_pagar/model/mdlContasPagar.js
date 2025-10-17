const db = require("../../../database/databaseconfig");

// Buscar todas as Contas
const getAllContasPagar = async () => {
    const { rows } = await db.query("SELECT * FROM contas_a_pagar ORDER BY id_contas")
    return rows;
}

// Buscar Conta ID
const getContasPagarByID = async (id_contas) => { 
    const { rows } = await db.query("SELECT * FROM contas_a_pagar WHERE id_contas = $1;",[id_contas]);
    return rows[0];
}

// Criar nova Conta
const insertContasPagar = async (dados) => {
    const { descricao, valor, data_vencimento, status, id_usuario } = dados;
  
    const { rows } = await db.query(
      `INSERT INTO contas_a_pagar (descricao, valor, data_vencimento, status, id_usuario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [descricao, valor, data_vencimento, status || 'Pendente', id_usuario]
    );
  
    return rows[0];
  };

// Atualizar Conta
const updateConstasPagar = async (id_constas, dados) => {
    const { rows } = await db.query(
        `UPDATE contas_a_pagar
         SET descricao = $1, valor = $2, data_vencimento = $3, status = $4
         WHERE id_contas = $5
         RETURNING *;`,
        [descricao, valor, data_vencimento, status, id_contas]
      );
    
      return rows[0];
}

// Deletar Contas
const deleteContasPagar = async (id_contas) => {
    await db.query("DELETE FROM contas_a_pagar WHERE id_contas = $1", [id_contas]);
    return { message: "Conta deletada com sucesso."};
};


module.exports = {
    getAllContasPagar,
    getContasPagarByID,
    insertContasPagar,
    updateConstasPagar,
    deleteContasPagar,
};