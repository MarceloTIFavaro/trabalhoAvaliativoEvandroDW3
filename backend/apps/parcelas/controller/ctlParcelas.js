const mdlParcelas = require("../model/mdlParcelas");

// Listar todas as parcelas ativas
const getAllParcelas = async (req, res) => {
  try {
    let parcelas = await mdlParcelas.getAllParcelas();
    parcelas = parcelas.map(mdlParcelas.verificarStatusAutomatico);
    res.status(200).json(parcelas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar parcelas", details: error.message });
  }
};

// Buscar parcela por ID
const getParcelasById = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const parcela = await mdlParcelas.getParcelasById(id_parcela);

    if (!parcela) return res.status(404).json({ error: "Parcela não encontrada" });

    res.status(200).json(mdlParcelas.verificarStatusAutomatico(parcela));
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar parcela", details: error.message });
  }
};

// Buscar parcelas por conta
const getParcelasByConta = async (req, res) => {
  try {
    const { id_conta } = req.body;
    let parcelas = await mdlParcelas.getParcelasByContaPagar(id_conta);
    parcelas = parcelas.map(mdlParcelas.verificarStatusAutomatico);
    res.status(200).json(parcelas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar parcelas da conta", details: error.message });
  }
};

// Criar nova parcela
const insertParcelas = async (req, res) => {
  try {
    const dados = req.body;
    dados.status = 'Pendente'; // forçar status inicial
    const parcela = await mdlParcelas.insertParcelas(dados);
    res.status(201).json(parcela);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar parcela", details: error.message });
  }
};

// Atualizar parcela
const updateParcelas = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const dados = req.body;

    const parcelaAtual = await mdlParcelas.getParcelasById(id_parcela);
    if (!parcelaAtual) return res.status(404).json({ error: "Parcela não encontrada" });

    // Manter status 'Pago' se já estiver pago
    if (parcelaAtual.status === 'Pago') {
      dados.status = 'Pago';
    } else {
      // Atualizar status com base na nova data de vencimento
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataVencimento = new Date(dados.data_vencimento);
      dataVencimento.setHours(0, 0, 0, 0);
      dados.status = dataVencimento < hoje ? 'Atrasado' : 'Pendente';
    }

    const parcelaAtualizada = await mdlParcelas.updateParcelas(id_parcela, dados);
    res.status(200).json(parcelaAtualizada);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar parcela", details: error.message });
  }
};

// Deletar parcela (lógica)
const deleteParcelas = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const resultado = await mdlParcelas.deleteParcelas(id_parcela);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar parcela", details: error.message });
  }
};

// Marcar parcela como paga
const marcarParcelaComoPaga = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const parcela = await mdlParcelas.marcarParcelaComoPaga(id_parcela);

    if (!parcela) return res.status(404).json({ error: "Parcela não encontrada" });

    res.status(200).json({
      message: "Parcela marcada como paga com sucesso",
      parcela
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao marcar parcela como paga", details: error.message });
  }
};

// Gerar parcelas automaticamente
// const gerarParcelas = async (req, res) => {
//   try{
//     const { id_conta, valor_total, numero_parcelas, data_inicial } = req.body;

//     const payload = {
//       id_conta: parseInt(id_conta),
//       valor_total: parseFloat(valor_total),
//       numero_parcelas: parseInt(numero_parcelas),
//       data_inicial: data_inicial
//     };
//   }
// }



module.exports = {
  getAllParcelas,
  getParcelasById,
  getParcelasByConta,
  insertParcelas,
  updateParcelas,
  deleteParcelas,
  marcarParcelaComoPaga,
};
