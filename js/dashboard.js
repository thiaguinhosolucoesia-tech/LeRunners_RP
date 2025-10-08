// ** FUNÇÕES DOS DASHBOARDS DE ATLETA E PROFESSOR **

async function loadAthleteDashboard() {
    const welcomeEl = document.getElementById("atletaWelcome");
    if (welcomeEl) welcomeEl.textContent = `Olá, ${window.appState.currentUser.name}!`;
    
    const stravaCard = document.getElementById('stravaCard');
    if (stravaCard) {
        stravaCard.addEventListener('click', (e) => {
            if (e.target.id === 'connectStravaBtn') connectStrava();
        });
    }

    await checkStravaConnection();
    await loadAthleteGoals();
    await loadKnowledgeBaseForUser('knowledgeListAthlete');
}

async function loadProfessorDashboard() {
    const welcomeEl = document.getElementById("professorWelcome");
    if(welcomeEl) welcomeEl.textContent = `Olá, ${window.appState.currentUser.name}!`;
    
    const addAthleteForm = document.getElementById('addAthleteForm');
    if (addAthleteForm) addAthleteForm.addEventListener('submit', handleAddAthlete);
    
    const goalsForm = document.getElementById('goalsForm');
    if (goalsForm) goalsForm.addEventListener('submit', handleSetGoals);

    await loadProfessorAthletes();
    await loadKnowledgeBaseForUser('knowledgeListProfessor');
}

async function loadAthleteGoals() {
    const goalsRef = database.ref(`users/${window.appState.currentUser.uid}/goals`);
    goalsRef.on("value", (snapshot) => {
        const goals = snapshot.val();
        const goalsListDiv = document.getElementById("goalsList");
        if (!goalsListDiv) return;

        if (goals && (goals.weeklyDistance || goals.targetRace)) {
            goalsListDiv.innerHTML = `<p><strong>Meta Semanal:</strong> ${goals.weeklyDistance || 'N/A'} km</p><p><strong>Prova Alvo:</strong> ${goals.targetRace || 'N/A'}</p><p><strong>Data:</strong> ${goals.raceDate ? new Date(goals.raceDate).toLocaleDateString() : 'N/A'}</p>`;
        } else {
            goalsListDiv.innerHTML = `<div class="empty-state"><i class="fas fa-bullseye"></i><p>Nenhum objetivo definido.</p></div>`;
        }
    });
}

async function loadProfessorAthletes() {
    const professorUid = window.appState.currentUser.uid;
    const athletesRef = database.ref("users").orderByChild("professorUid").equalTo(professorUid);
    athletesRef.on("value", (snapshot) => {
        const athletes = snapshot.val();
        const listDiv = document.getElementById("athletesList");
        if (!listDiv) return;
        listDiv.innerHTML = "";
        
        if (athletes) {
            Object.keys(athletes).forEach(uid => {
                const athlete = { uid, ...athletes[uid] };
                const card = document.createElement("div");
                card.className = "athlete-card";
                card.innerHTML = `<div class="athlete-info"><h3>${athlete.name}</h3><p>${athlete.email}</p></div><div class="athlete-actions"><button class="btn-secondary" onclick="openGoalsModal('${athlete.uid}', '${athlete.name}')"><i class="fas fa-bullseye"></i> Objetivos</button></div>`;
                listDiv.appendChild(card);
            });
        } else {
            listDiv.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>Nenhum atleta cadastrado.</p></div>`;
        }
    });
}

async function loadKnowledgeBaseForUser(elementId) {
    const knowledgeRef = database.ref("knowledge");
    knowledgeRef.on("value", (snapshot) => {
        const items = snapshot.val();
        const listDiv = document.getElementById(elementId);
        if (!listDiv) return;
        listDiv.innerHTML = "";

        if (items) {
             Object.keys(items).forEach(key => {
                const item = items[key];
                const card = document.createElement('div');
                card.className = 'knowledge-card';
                card.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p><a href="${item.fileContent}" download="${item.fileName}" class="btn-secondary"><i class="fas fa-download"></i> Baixar</a>`;
                listDiv.appendChild(card);
            });
        } else {
            listDiv.innerHTML = `<div class="empty-state"><i class="fas fa-brain"></i><p>Nenhum item de conhecimento disponível.</p></div>`;
        }
    });
}

async function handleAddAthlete(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    const name = document.getElementById("athleteName").value;
    const email = document.getElementById("athleteEmail").value;
    const password = document.getElementById("athletePassword").value;
    
    const secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, `add-athlete-${Date.now()}`);
    try {
        const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
        await database.ref(`users/${userCredential.user.uid}`).set({ 
            name, email, type: 'atleta', professorUid: window.appState.currentUser.uid, createdAt: new Date().toISOString() 
        });
        showSuccess(`Atleta ${name} criado com sucesso!`);
        closeAddAthleteModal();
    } catch (error) {
        showError(getErrorMessage(error));
    } finally {
        secondaryApp.delete();
        setButtonLoading(btn, false);
    }
}

let currentAthleteUidForGoals = null;
async function handleSetGoals(e) {
    e.preventDefault();
    if (!currentAthleteUidForGoals) return;
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    const goals = {
        weeklyDistance: document.getElementById('weeklyDistance').value,
        targetRace: document.getElementById('targetRace').value,
        raceDate: document.getElementById('raceDate').value
    };
    try {
        await database.ref(`users/${currentAthleteUidForGoals}/goals`).set(goals);
        showSuccess("Objetivos salvos!");
        closeGoalsModal();
    } catch (error) {
        showError("Erro ao salvar os objetivos.");
    } finally {
        setButtonLoading(btn, false);
    }
}

// Funções de controle dos Modais
function showAddAthleteModal() { document.getElementById("addAthleteModal").classList.add("active"); }
function closeAddAthleteModal() { document.getElementById("addAthleteModal").classList.remove("active"); document.getElementById('addAthleteForm').reset(); }
function openGoalsModal(athleteUid, athleteName) {
    currentAthleteUidForGoals = athleteUid;
    document.getElementById('goalsAthleteName').textContent = `Metas para ${athleteName}`;
    document.getElementById('goalsForm').reset();
    database.ref(`users/${athleteUid}/goals`).once('value').then(snapshot => {
        if(snapshot.exists()) {
            const goals = snapshot.val();
            document.getElementById('weeklyDistance').value = goals.weeklyDistance || '';
            document.getElementById('targetRace').value = goals.targetRace || '';
            document.getElementById('raceDate').value = goals.raceDate || '';
        }
    });
    document.getElementById("goalsModal").classList.add("active");
}
function closeGoalsModal() { document.getElementById("goalsModal").classList.remove("active"); currentAthleteUidForGoals = null; }

// Funções de navegação por abas
function showDashTab(tabName) {
    document.querySelectorAll('#atletaDashboard .dash-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('#atletaDashboard .dash-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
}
function showProfTab(tabName) {
    document.querySelectorAll('#professorDashboard .dash-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('#professorDashboard .dash-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
}