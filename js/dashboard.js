// Funções para os dashboards de Atleta e Professor
async function loadAthleteDashboard() {
    showLoading(true);
    document.getElementById("atletaWelcome").textContent = `Olá, ${window.appState.currentUser.name}!`;
    await loadAthleteGoals();
    await checkStravaConnection();
    await loadKnowledgeBaseForUser();
    showLoading(false);
}

async function loadProfessorDashboard() {
    showLoading(true);
    document.getElementById("professorWelcome").textContent = `Olá, ${window.appState.currentUser.name}!`;
    await loadProfessorAthletes();
    await loadKnowledgeBaseForUser();
    showLoading(false);
}

async function loadAthleteGoals() {
    const goalsRef = database.ref(`users/${window.appState.currentUser.uid}/goals`);
    goalsRef.on("value", (snapshot) => {
        const goals = snapshot.val();
        // Lógica para renderizar os objetivos na tela do atleta...
    });
}

async function loadProfessorAthletes() {
    const professorUid = window.appState.currentUser.uid;
    const athletesRef = database.ref("users").orderByChild("professorUid").equalTo(professorUid);
    athletesRef.on("value", (snapshot) => {
        const athletes = snapshot.val() || {};
        // Lógica para renderizar a lista de atletas para o professor...
    });
}

async function setAthleteGoals(athleteUid, goals) {
    showLoading(true);
    try {
        await database.ref(`users/${athleteUid}/goals`).set(goals);
    } catch (error) {
        showError("Erro ao definir objetivos.");
    } finally {
        showLoading(false);
    }
}

async function loadKnowledgeBaseForUser() {
    const knowledgeRef = database.ref("knowledge");
    knowledgeRef.on("value", (snapshot) => {
        const items = snapshot.val() || {};
        // Lógica para renderizar a base de conhecimento para o usuário logado...
    });
}