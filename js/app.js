// Arquivo principal da aplicação
let selectedAthleteUid = null;
let confirmCallback = null;

document.addEventListener('DOMContentLoaded', function() {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    database = firebase.database();
    storage = firebase.storage();

    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    showScreen('loginScreen');
}

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('confirmActionBtn').addEventListener('click', () => {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        closeConfirmationModal();
    });
    // Adicionar outros listeners para modais e formulários conforme necessário
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(loginBtn, true);
    
    try {
        const success = await loginUser(email, password);
        if (success) {
            e.target.reset();
        }
    } finally {
        setButtonLoading(loginBtn, false);
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');
}

async function showDashboard(userType) {
    const dashboards = {
        admin: { id: 'adminDashboard', load: loadAdminDashboard },
        professor: { id: 'professorDashboard', load: loadProfessorDashboard },
        atleta: { id: 'atletaDashboard', load: loadAthleteDashboard }
    };
    if (dashboards[userType]) {
        showScreen(dashboards[userType].id);
        await dashboards[userType].load();
    } else {
        showScreen('loginScreen');
    }
}

function showConfirmationModal(message, onConfirm) {
    document.getElementById('confirmationMessage').textContent = message;
    confirmCallback = onConfirm;
    document.getElementById('confirmationModal').classList.add('active');
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').classList.remove('active');
    confirmCallback = null;
}

function showLoading(show) {
    document.getElementById('loadingOverlay').classList.toggle('active', show);
}

function setButtonLoading(button, loading) {
    if (button) {
        button.classList.toggle('loading', loading);
        button.disabled = loading;
    }
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
    }
}