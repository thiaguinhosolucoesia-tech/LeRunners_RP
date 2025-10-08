// Funções específicas para os dashboards de Atleta e Professor

// Carregar dashboard do atleta
async function loadAthleteDashboard() {
    showLoading(true);
    document.getElementById("atletaWelcome").textContent = `Olá, ${window.appState.currentUser.name}!`;
    await loadAthleteData();
    await loadAthleteGoals();
    await loadAthleteActivities();
    await loadKnowledgeBase(); // Carregar base de conhecimento para atletas
    showLoading(false);
}

async function loadAthleteData() {
    // Implementar lógica para carregar dados específicos do atleta (se houver)
    // Por exemplo, informações de perfil, etc.
}

async function loadAthleteGoals() {
    const goalsRef = database.ref(`users/${window.appState.currentUser.uid}/goals`);
    goalsRef.on("value", (snapshot) => {
        const goals = snapshot.val();
        const goalsListDiv = document.getElementById("goalsList");
        goalsListDiv.innerHTML = "";

        if (goals) {
            document.getElementById("progressCard").style.display = "block";
            document.getElementById("progressText").textContent = `Meta Semanal: ${goals.weeklyDistance || 0} km`;
            // Lógica para calcular progresso real vs meta semanal
            // Por enquanto, apenas exibe a meta

            const goalCard = `
                <div class="goal-item">
                    <i class="fas fa-bullseye"></i>
                    <p>Meta Semanal: <strong>${goals.weeklyDistance || 0} km</strong></p>
                </div>
                ${goals.targetRace ? `
                <div class="goal-item">
                    <i class="fas fa-flag-checkered"></i>
                    <p>Prova Alvo: <strong>${goals.targetRace}</strong></p>
                </div>` : ''}
                ${goals.raceDate ? `
                <div class="goal-item">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Data da Prova: <strong>${new Date(goals.raceDate).toLocaleDateString()}</strong></p>
                </div>` : ''}
            `;
            goalsListDiv.innerHTML = goalCard;
        } else {
            document.getElementById("progressCard").style.display = "none";
            goalsListDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-target"></i>
                    <p>Nenhum objetivo definido</p>
                    <small>Entre em contato com seu treinador para definir suas metas</small>
                </div>
            `;
        }
    });
}

async function loadAthleteActivities() {
    // Implementar lógica para carregar atividades do atleta (Firebase ou Strava)
    // Por enquanto, apenas exibe o estado vazio ou Strava
    const activitiesListDiv = document.getElementById("activitiesList");
    activitiesListDiv.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-running"></i>
            <p>Nenhuma atividade encontrada</p>
            <small>Conecte sua conta Strava para ver suas atividades</small>
        </div>
    `;
}

// Carregar dashboard do professor
async function loadProfessorDashboard() {
    showLoading(true);
    document.getElementById("professorWelcome").textContent = `Olá, ${window.appState.currentUser.name}!`;
    await loadProfessorAthletes();
    await loadKnowledgeBase(); // Carregar base de conhecimento para professores
    showLoading(false);
}

async function loadProfessorAthletes() {
    const professorUid = window.appState.currentUser.uid;
    const athletesRef = database.ref("users").orderByChild("professorUid").equalTo(professorUid);

    athletesRef.on("value", (snapshot) => {
        const athletes = snapshot.val();
        const athletesListDiv = document.getElementById("athletesList");
        athletesListDiv.innerHTML = "";
        window.appState.athletes = []; // Limpar atletas anteriores

        let totalAthletes = 0;
        let stravaConnected = 0;
        let withGoals = 0;

        if (athletes) {
            Object.keys(athletes).forEach(uid => {
                const athlete = athletes[uid];
                window.appState.athletes.push({ ...athlete, uid });
                totalAthletes++;

                if (athlete.stravaAccessToken) stravaConnected++;
                if (athlete.goals) withGoals++;

                const athleteCard = `
                    <div class="athlete-card">
                        <div class="athlete-avatar">
                            <i class="fas ${athlete.type === 'professor' ? 'fa-user-tie' : 'fa-running'}"></i>
                        </div>
                        <div class="athlete-info">
                            <h3>${athlete.name}</h3>
                            <p>${athlete.email}</p>
                            <p>${athlete.stravaAccessToken ? 
                                `<i class="fab fa-strava"></i> Conectado` : 
                                `<i class="fab fa-strava"></i> Desconectado`}
                            </p>
                        </div>
                        <div class="athlete-actions">
                            <button class="btn-secondary" onclick="openGoalsModal('${uid}', '${athlete.name}')">
                                <i class="fas fa-bullseye"></i> Objetivos
                            </button>
                            <button class="btn-secondary" onclick="viewAthleteDetails('${uid}')">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                        </div>
                    </div>
                `;
                athletesListDiv.innerHTML += athleteCard;
            });
        }

        document.getElementById("totalAthletes").textContent = totalAthletes;
        document.getElementById("stravaConnected").textContent = stravaConnected;
        document.getElementById("withGoals").textContent = withGoals;

        if (totalAthletes === 0) {
            athletesListDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Nenhum atleta cadastrado</p>
                    <small>Comece adicionando seus primeiros atletas à plataforma</small>
                    <button class="btn-primary" onclick="showAddAthleteModal()">
                        <i class="fas fa-plus"></i> Adicionar Primeiro Atleta
                    </button>
                </div>
            `;
        }

        // Atualizar resumo dos atletas (seção de overview do professor)
        updateProfessorOverviewSummary();
    });
}

async function setAthleteGoals(athleteUid, goals) {
    showLoading(true);
    try {
        await database.ref(`users/${athleteUid}/goals`).set(goals);
        showSuccess("Objetivos do atleta atualizados com sucesso!");
    } catch (error) {
        console.error("Erro ao definir objetivos:", error);
        showError("Erro ao definir objetivos: " + error.message);
    } finally {
        showLoading(false);
    }
}

function viewAthleteDetails(athleteUid) {
    // Implementar visualização de detalhes do atleta
    alert(`Visualizar detalhes do atleta: ${athleteUid}`);
}

function updateProfessorOverviewSummary() {
    const athletesSummaryDiv = document.getElementById("athletesSummary");
    athletesSummaryDiv.innerHTML = "";

    if (window.appState.athletes.length > 0) {
        window.appState.athletes.forEach(athlete => {
            const summaryCard = `
                <div class="athlete-summary-card">
                    <h4>${athlete.name}</h4>
                    <p>Email: ${athlete.email}</p>
                    <p>Strava: ${athlete.stravaAccessToken ? `Conectado` : `Desconectado`}</p>
                    ${athlete.goals ? 
                        `<p>Meta Semanal: ${athlete.goals.weeklyDistance || 0} km</p>` : 
                        `<p>Sem metas definidas</p>`}
                </div>
            `;
            athletesSummaryDiv.innerHTML += summaryCard;
        });
    } else {
        athletesSummaryDiv.innerHTML = `
            <div class="empty-state">
                <p>Nenhum atleta cadastrado ainda.</p>
            </div>
        `;
    }
}

