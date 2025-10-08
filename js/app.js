// Arquivo principal da aplicação

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    database = firebase.database();
    storage = firebase.storage();

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

// Manipular login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const loginBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(loginBtn, true);
    
    await loginUser(email, password);
    
    setButtonLoading(loginBtn, false);
}

// Mostrar tela
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add('active');
    }
}

// Mostrar dashboard correto após login
async function showDashboard(userType) {
    switch (userType) {
        case 'admin':
            showScreen('adminDashboard');
            await loadAdminDashboard();
            break;
        case 'professor':
            showScreen('professorDashboard');
            // await loadProfessorDashboard(); // Descomente quando a função for implementada
            break;
        case 'atleta':
            showScreen('atletaDashboard');
            // await loadAthleteDashboard(); // Descomente quando a função for implementada
            break;
        default:
            showScreen('loginScreen');
            break;
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
    
    setTimeout(() => {
        if (successEl.parentNode) {
            successEl.parentNode.removeChild(successEl);
        }
    }, 3000);
}