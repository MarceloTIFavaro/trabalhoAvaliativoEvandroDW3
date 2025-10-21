// ===================================
// FUNÇÕES COMUNS DO SISTEMA
// ===================================

// Função global para exibir toast
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error('Toast container não encontrado');
        return;
    }
    
    const toastId = 'toast-' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : 'bg-danger';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgColor} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${icon} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Função para verificar se a conta está atrasada
function verificarAtrasada(dataVencimento) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    return vencimento < hoje;
}

// Função para formatar data para exibição
function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
}

// Função para formatar data para input date
function formatarDataInput(dataStr) {
    const data = new Date(dataStr);
    return data.toISOString().split('T')[0];
}

// Função para formatar valor monetário
function formatarValor(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

// Função para confirmar exclusão
function confirmarExclusao(mensagem = 'Tem certeza que deseja excluir?') {
    return confirm(mensagem);
}

// Verificar sessão e redirecion ar se necessário
function verificarSessao() {
    // Aqui você pode adicionar lógica para verificar se o usuário está logado
    // Por exemplo, verificando cookies ou localStorage
}

// Chamar ao carregar a página
if (typeof window !== 'undefined') {
    window.addEventListener('load', verificarSessao);
}

