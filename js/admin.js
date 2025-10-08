// Funções do Dashboard do Administrador
async function loadAdminDashboard() {
    showLoading(true);
    document.getElementById("adminWelcome").textContent = `Olá, ${window.appState.currentUser.name || 'Admin'}!`;
    await loadAdminUsers();
    await loadKnowledgeBase();
    showLoading(false);
}

function showAdminTab(tabName) {
    document.querySelectorAll("#adminDashboard .dash-tab-btn").forEach(btn => btn.classList.remove("active"));
    event.currentTarget.classList.add("active");
    document.querySelectorAll("#adminDashboard .dash-tab-content").forEach(content => content.classList.remove("active"));
    document.getElementById(`admin${tabName}Tab`).classList.add("active");
}

async function loadAdminUsers() {
    const usersRef = database.ref("users");
    usersRef.on("value", (snapshot) => {
        const users = snapshot.val() || {};
        const usersListDiv = document.getElementById("adminUsersList");
        usersListDiv.innerHTML = "";
        let counters = { users: 0, professors: 0, athletes: 0 };
        Object.values(users).forEach(user => {
            if (user.type !== 'admin') counters.users++;
            if (user.type === 'professor') counters.professors++;
            if (user.type === 'atleta') counters.athletes++;
        });
        document.getElementById("totalUsers").textContent = counters.users;
        document.getElementById("totalProfessors").textContent = counters.professors;
        document.getElementById("totalAthletesAdmin").textContent = counters.athletes;
        // Lógica para renderizar a lista de usuários...
    });
}

function confirmDeleteUser(uid) {
    showConfirmationModal("Tem certeza que deseja excluir este usuário?", () => deleteUser(uid));
}

async function deleteUser(uid) {
    showLoading(true);
    try {
        await database.ref(`users/${uid}`).remove();
    } catch (error) {
        showError("Erro ao remover usuário.");
    } finally {
        showLoading(false);
    }
}

async function handleAddUser(e) { e.preventDefault(); /* ... */ }
function showAddUserModal() { /* ... */ }
async function handleUploadKnowledge(e) { e.preventDefault(); /* ... */ }
async function loadKnowledgeBase() { /* ... */ }