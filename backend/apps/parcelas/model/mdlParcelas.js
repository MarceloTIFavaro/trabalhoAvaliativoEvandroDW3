const db = require("../../../database/databaseconfig");

// Buscar Todas as Parcelas
const getAllParcelas = async () => {
    const { rows } = await db.query("SELECT FROM parcelas WHERE id_parcela;");
    return rows;
}

// Buscar Parcelas por ID
const getParcelasById = async (id_user) => {
    const { rows } = await db.query("SELECT * FROM parcelas WHERE id_parcela = $1;", [id_parcela]);
    return rows[0];
}

// Buscar Parcelas por Conta
const getParcelasByContaPagar = async (id_parcela) => {
    const{ rows } = await db.query(
        "SELECT * FROM parcelas WHERE id_contas = $1 ORDER BY data_vencimento ASC;",
        [id_contas]
    );
    return rows;
}

// Criar nova Parcela
const insertParcelas = async (dados) => {
    const{numero_parcela, valor, data_vencimento, id_contas} = dados;

    const { rows } = await db.query(
        'INSERT INTO parcelas (numero_parcela, valor, data_vencimento, id_contas) VALUES ($1, $2, $3, $4, $5) RETURNING *;', [numero_parcela, valor, data_vencimento, id_contas]
    );
    return rows [0];

}

// Atualizar Parcela
const updateParcelas = async (id_parcela, dados) => {
    const{status} = dados;
    const { rows } = await db.query(
        'UPDATE parcelas SET status = $1 WHERE id_parcela = $2 RETURNING *;',
        [status]
    );
    return rows [0];
}

// Deletar Parcela
const deleteParcelas = async (id_parcela) => {
    await db.query("DELETE FROM parcelas WHERE id_parcela = $1", [id_parcela]);
    return { message: "Parcela apagada com sucesso."};
}

// Marcar parcela como paga
const marcarParcelaComoPaga = async (id_parcela) => {
    const { rows } = await db.query(
        "UPDATE parcelas SET status = 'Pago' WHERE id_parcela = $1 RETURNING *;", [id_parcela]
    );
    return rows[0];
}

// Verificar e atualizar status baseado na data de vencimento 
const verificarStatusAutomatico = (parcela) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataVencimento = new Date(conta, data_vencimento);
    dataVencimento.setHours(0, 0, 0, 0);

    // Se já está pago, mantém pago
    if (conta.status == 'Pago'){
        return parcela;
    }
    // Se passou da data de vencimento, está atrasado 
    if (dataVencimento < hoje){
        conta.status = 'Atrasado';
    }else{
        // Caso contrário, está pendente
        conta.status = 'Pendente';
    }
    return parcela;
}

module.exports = {
    getAllParcelas,
    getParcelasById,
    getParcelasByContaPagar,
    insertParcelas,
    updateParcelas,
    deleteParcelas,
    marcarParcelaComoPaga,
    verificarStatusAutomatico,
}

