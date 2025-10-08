// Arquivo principal da aplicação

// Variáveis globais
let selectedAthleteUid = null;

// Inicialização da aplicação
document.addEventListener(\'DOMContentLoaded\', function() {
    // Inicializar Firebase e referências globais
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    database = firebase.database();
    storage = firebase.storage(); // Inicializar Firebase Storage

    initializeApp();
    setupEventListeners();
});

// Inicializar aplicação
function initializeApp() {
    // Mostrar tela de login inicialmente
    showScreen(\'loginScreen\');
}

// Configurar event listeners
function setupEventListeners() {
    // Forms de login
    document.getElementById(\'loginForm\').addEventListener(\'submit\', handleLogin);

    // Forms de modais
    document.getElementById(\'addAthleteForm\').addEventListener(\'submit\', handleAddAthlete);
    document.getElementById(\'goalsForm\').addEventListener(\'submit\', handleSetGoals);
    document.getElementById(\'addUserForm\').addEventListener(\'submit\', handleAddUser);
    document.getElementById(\'uploadKnowledgeForm\').addEventListener(\'submit\', handleUploadKnowledge);
    
    // Fechar modais ao clicar fora
    document.querySelectorAll(\'.modal\').forEach(modal => {
        modal.addEventListener(\'click\', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
}

// Manipular login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById(\'loginEmail\').value;
    const password = document.getElementById(\'loginPassword\').value;
    
    const loginBtn = e.target.querySelector(\'button[type="submit"]\');
    setButtonLoading(loginBtn, true);
    
    const success = await loginUser(email, password);
    
    setButtonLoading(loginBtn, false);
    
    if (success) {
        e.target.reset();
    }
}

// Manipular adição de atleta (agora usado por Professor e Admin)
async function handleAddAthlete(e) {
    e.preventDefault();
    
    const name = document.getElementById(\'athleteName\').value;
    const email = document.getElementById(\'athleteEmail\').value;
    const phone = document.getElementById(\'athletePhone\').value;
    
    // Criar usuário no Firebase Auth e no Realtime DB
    try {
        showLoading(true);
        const userCredential = await auth.createUserWithEmailAndPassword(email, "senha_padrao"); // Senha padrão para novos atletas
        const user = userCredential.user;

        await database.ref(`users/${user.uid}`).set({
            name: name,
            email: email,
            phone: phone || null,
            type: "atleta",
            professorUid: window.appState.currentUser.uid, // Atribuir ao professor ou admin que o cadastrou
            createdAt: new Date().toISOString()
        });
        showSuccess(`Atleta ${name} adicionado com sucesso!`);
        closeAddAthleteModal();
        // Recarregar lista de atletas se estiver no dashboard do professor ou admin
        if (window.appState.userType === "professor") {
            loadProfessorDashboard();
        } else if (window.appState.userType === "admin") {
            loadAdminDashboard();
        }
    } catch (error) {
        console.error("Erro ao adicionar atleta:", error);
        showError(getErrorMessage(error));
    } finally {
        showLoading(false);
    }
    e.target.reset();
}

// Manipular definição de objetivos
async function handleSetGoals(e) {
    e.preventDefault();
    
    if (!selectedAthleteUid) return;
    
    const weeklyDistance = parseFloat(document.getElementById(\'weeklyDistance\').value);
    const targetRace = document.getElementById(\'targetRace\').value;
    const raceDate = document.getElementById(\'raceDate\').value;
    
    const goals = {
        weeklyDistance,
        targetRace: targetRace || null,
        raceDate: raceDate || null
    };
    
    await setAthleteGoals(selectedAthleteUid, goals);
    
    closeGoalsModal();
    e.target.reset();
}

// Funções de UI

// Mostrar tela
function showScreen(screenId) {
    document.querySelectorAll(\'.screen\').forEach(screen => {
        screen.classList.remove(\'active\');
    });
    document.getElementById(screenId).classList.add(\'active\');
}

// Mostrar dashboard correto após login
async function showDashboard(userType) {
    switch (userType) {
        case \'admin\':
            showScreen(\'adminDashboard\');
            await loadAdminDashboard();
            break;
        case \'professor\':
            showScreen(\'professorDashboard\');
            await loadProfessorDashboard();
            break;
        case \'atleta\':
            showScreen(\'atletaDashboard\');
            await loadAthleteDashboard();
            break;
        default:
            showScreen(\'loginScreen\');
            break;
    }
}

// Mostrar tabs do dashboard do atleta
function showDashTab(tabName) {
    // Atualizar botões
    document.querySelectorAll(\'#atletaDashboard .dash-tab-btn\').forEach(btn => {
        btn.classList.remove(\'active\');
    });
    event.target.classList.add(\'active\');
    
    // Atualizar conteúdo
    document.querySelectorAll(\'#atletaDashboard .dash-tab-content\').forEach(content => {
        content.classList.remove(\'active\');
    });
    document.getElementById(tabName + \'Tab\').classList.add(\'active\');

    if (tabName === 'knowledgeAthlete') {
        loadKnowledgeBase(); // Carregar base de conhecimento para atletas
    }
}

// Mostrar tabs do dashboard do professor
function showProfTab(tabName) {
    // Atualizar botões
    document.querySelectorAll(\'#professorDashboard .dash-tab-btn\').forEach(btn => {
        btn.classList.remove(\'active\');
    });
    event.target.classList.add(\'active\');
    
    // Atualizar conteúdo
    document.querySelectorAll(\'#professorDashboard .dash-tab-content\').forEach(content => {
        content.classList.remove(\'active\');
    });
    
    if (tabName === \'overview\') {
        document.getElementById(\'profOverviewTab\').classList.add(\'active\');
    } else {
        document.getElementById(tabName + \'Tab\').classList.add(\'active\');
    }

    if (tabName === 'knowledgeProfessor') {
        loadKnowledgeBase(); // Carregar base de conhecimento para professores
    }
}

// Modais
function showAddAthleteModal() {
    document.getElementById(\'addAthleteModal\').classList.add(\'active\');
}

function closeAddAthleteModal() {
    document.getElementById(\'addAthleteModal\').classList.remove(\'active\');
    document.getElementById(\'addAthleteForm\').reset();
}

function openGoalsModal(athleteUid, athleteName) {
    selectedAthleteUid = athleteUid;
    document.getElementById(\'goalsAthleteNome\').textContent = `Definir Objetivos para ${athleteName}`;
    
    // Carregar objetivos existentes
    database.ref(`users/${athleteUid}/goals`).once(\'value\').then(snapshot => {
        const goals = snapshot.val();
        if (goals) {
            document.getElementById(\'weeklyDistance\').value = goals.weeklyDistance || \'\';
            document.getElementById(\'targetRace\').value = goals.targetRace || \'\';
            document.getElementById(\'raceDate\').value = goals.raceDate || \'\';
        } else {
            document.getElementById(\'goalsForm\').reset();
        }
    }).catch(error => {
        console.error("Erro ao carregar objetivos:", error);
        showError("Erro ao carregar objetivos.");
    });
    
    document.getElementById(\'goalsModal\').classList.add(\'active\');
}

function closeGoalsModal() {
    selectedAthleteUid = null;
    document.getElementById(\'goalsModal\').classList.remove(\'active\');
    document.getElementById(\'goalsForm\').reset();
}

function closeAllModals() {
    document.querySelectorAll(\'.modal\').forEach(modal => {
        modal.classList.remove(\'active\');
    });
}

// Estados de loading
function showLoading(show) {
    const overlay = document.getElementById(\'loadingOverlay\');
    if (show) {
        overlay.classList.add(\'active\');
    } else {
        overlay.classList.remove(\'active\');
    }
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add(\'loading\');
        button.disabled = true;
    } else {
        button.classList.remove(\'loading\');
        button.disabled = false;
    }
}

// Mensagens
function showError(message) {
    const errorEl = document.getElementById(\'errorMessage\');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = \'block\';
        
        setTimeout(() => {
            errorEl.style.display = \'none\';
        }, 5000);
    } else {
        alert(\'Erro: \' + message);
    }
}

function showSuccess(message) {
    // Criar elemento de sucesso temporário
    const successEl = document.createElement(\'div\');
    successEl.className = \'success-message\';
    successEl.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Adicionar ao body
    document.body.appendChild(successEl);
    
    // Posicionar no topo
    successEl.style.position = \'fixed\';
    successEl.style.top = \'20px\';
    successEl.style.right = \'20px\';
    successEl.style.zIndex = \'9999\';
    successEl.style.maxWidth = \'300px\';
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (successEl.parentNode) {
            successEl.parentNode.removeChild(successEl);
        }
    }, 3000);
}

// Utilitários
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Ajustar layout para mobile
function adjustForMobile() {
    if (isMobile()) {
        document.body.classList.add(\'mobile\');
    } else {
        document.body.classList.remove(\'mobile\');
    }
}

// Listener para redimensionamento
window.addEventListener(\'resize\', debounce(adjustForMobile, 250));

// Ajustar na inicialização
adjustForMobile();

