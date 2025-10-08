// Arquivo principal da aplicação - Ponto de entrada e controle de UI

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    database = firebase.database();
    // storage não é mais usado, mas a referência pode ficar

    // Anexa o listener de login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Inicia a verificação de autenticação
    checkAuthState();
});

// Manipular login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(loginBtn, true);
    await loginUser(email, password); // Chama a função de auth.js
    setButtonLoading(loginBtn, false);
}

// Mostra a tela correta e esconde as outras
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add('active');
    } else {
        console.error(`Tela com ID '${screenId}' não encontrada.`);
    }
}

// Orquestra a exibição do dashboard correto após o login
async function showDashboard(userType) {
    showLoading(true);
    // Esconde a tela de login antes de carregar o dashboard
    showScreen('loadingOverlay'); 

    try {
        switch (userType) {
            case 'admin':
                showScreen('adminDashboard');
                await loadAdminDashboard();
                break;
            case 'professor':
                showScreen('professorDashboard');
                await loadProfessorDashboard();
                break;
            case 'atleta':
                showScreen('atletaDashboard');
                await loadAthleteDashboard();
                break;
            default:
                showScreen('loginScreen');
                break;
        }
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        showError("Não foi possível carregar o painel. Tente novamente.");
        logout(); // Desloga o usuário em caso de erro crítico
    } finally {
        showLoading(false);
    }
}

// Funções de UI genéricas
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

function setButtonLoading(button, loading) {
    if (!button) return;
    button.disabled = loading;
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    if(btnText) btnText.style.display = loading ? 'none' : 'inline';
    if(btnLoading) btnLoading.style.display = loading ? 'inline' : 'none';
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
    } else {
        alert('Erro: ' + message);
    }
}

function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'success-message';
    successEl.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    document.body.appendChild(successEl);
    setTimeout(() => { if (successEl.parentNode) { successEl.parentNode.removeChild(successEl); } }, 3000);
}