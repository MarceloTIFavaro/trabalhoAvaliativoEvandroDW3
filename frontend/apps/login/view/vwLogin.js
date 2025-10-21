// ===================================
// FUNÇÕES DE NOTIFICAÇÃO (TOAST)
// ===================================
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
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
    
    // Remove o elemento após fechar
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// ===================================
// MUDANÇA DE LABEL CPF/CNPJ
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="tipo"]');
    const labelCpfCnpj = document.getElementById('labelCpfCnpj');
    const inputCpfCnpj = document.getElementById('cadastroCpfCnpj');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Empresa') {
                labelCpfCnpj.textContent = 'CNPJ';
                inputCpfCnpj.placeholder = '00.000.000/0000-00';
            } else {
                labelCpfCnpj.textContent = 'CPF';
                inputCpfCnpj.placeholder = '000.000.000-00';
            }
            inputCpfCnpj.value = '';
        });
    });
});

// ===================================
// FORMULÁRIO DE LOGIN
// ===================================
document.getElementById('formLogin').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('loginEmail').value,
        senha: document.getElementById('loginSenha').value
    };
    
    try {
        const response = await axios.post('/Login', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.status === 'ok') {
            showToast('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    } catch (error) {
        console.error('Erro no login:', error);
        const errorMsg = error.response?.data?.msg || 'Erro ao fazer login';
        showToast(errorMsg, 'error');
    }
});

// ===================================
// FORMULÁRIO DE CADASTRO
// ===================================
document.getElementById('formCadastro').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const senha = document.getElementById('cadastroSenha').value;
    
    if (senha.length < 6) {
        showToast('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }
    
    const formData = {
        nome: document.getElementById('cadastroNome').value,
        email: document.getElementById('cadastroEmail').value,
        senha: senha,
        tipo: document.querySelector('input[name="tipo"]:checked').value,
        cpf_cnpj: document.getElementById('cadastroCpfCnpj').value
    };
    
    try {
        const response = await axios.post('/Cadastro', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.status === 'ok') {
            showToast('Cadastro realizado com sucesso!', 'success');
            
            // Limpa o formulário
            document.getElementById('formCadastro').reset();
            
            // Volta para a aba de login
            setTimeout(() => {
                document.getElementById('login-tab').click();
            }, 1500);
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        const errorMsg = error.response?.data?.msg || 'Erro ao cadastrar usuário';
        showToast(errorMsg, 'error');
    }
});

// Limpa localStorage e cookies ao carregar
window.onload = function() {
    localStorage.clear();
    document.getElementById('loginEmail').focus();
};

