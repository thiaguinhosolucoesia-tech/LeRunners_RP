async function loadAdminDashboard() {
    const welcomeEl = document.getElementById("adminWelcome");
    if (welcomeEl) welcomeEl.textContent = `Olá, ${window.appState.currentUser.name || 'Admin'}!`;
    
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('uploadKnowledgeForm').addEventListener('submit', handleUploadKnowledge);
    
    await loadAdminUsers();
    await loadKnowledgeBase();
}

function showAdminTab(tabName) {
    document.querySelectorAll("#adminDashboard .dash-tab-btn").forEach(btn => btn.classList.remove("active"));
    event.currentTarget.classList.add("active");

    document.querySelectorAll("#adminDashboard .dash-tab-content").forEach(content => content.classList.remove("active"));
    const tabContentId = `admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
    const tabContent = document.getElementById(tabContentId);
    if(tabContent) tabContent.classList.add("active");
}

async function loadAdminUsers() {
    const usersRef = database.ref("users");
    usersRef.on("value", (snapshot) => {
        const users = snapshot.val();
        const usersListDiv = document.getElementById("adminUsersList");
        if (!usersListDiv) return;
        usersListDiv.innerHTML = "";
        let totalUsers = 0, totalProfessors = 0, totalAthletes = 0;

        if (users) {
            Object.keys(users).forEach(uid => {
                const user = users[uid];
                if (user.type === "admin") return;
                totalUsers++;
                if (user.type === "professor") totalProfessors++;
                if (user.type === "atleta") totalAthletes++;
            });
        }
        const totalUsersEl = document.getElementById("totalUsers");
        const totalProfessorsEl = document.getElementById("totalProfessors");
        const totalAthletesAdminEl = document.getElementById("totalAthletesAdmin");

        if(totalUsersEl) totalUsersEl.textContent = totalUsers;
        if(totalProfessorsEl) totalProfessorsEl.textContent = totalProfessors;
        if(totalAthletesAdminEl) totalAthletesAdminEl.textContent = totalAthletes;
    });
}

function showAddUserModal() { document.getElementById("addUserModal").classList.add("active"); }
function closeAddUserModal() { document.getElementById("addUserModal").classList.remove("active"); document.getElementById("addUserForm").reset(); }

async function handleAddUser(e) {
    e.preventDefault();
    const addUserBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(addUserBtn, true);
    const { name, email, password, type } = {
        name: document.getElementById("newUserName").value,
        email: document.getElementById("newUserEmail").value,
        password: document.getElementById("newUserPassword").value,
        type: document.getElementById("newUserType").value
    };
    
    const secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, `secondary-auth-${Date.now()}`);
    try {
        const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;
        await database.ref(`users/${newUser.uid}`).set({ name, email, type, createdAt: new Date().toISOString() });
        showSuccess(`Usuário ${name} criado com sucesso!`);
        closeAddUserModal();
    } catch (error) {
        showError(getErrorMessage(error));
    } finally {
        secondaryApp.delete();
        setButtonLoading(addUserBtn, false);
    }
}

function showUploadKnowledgeModal() { document.getElementById("uploadKnowledgeModal").classList.add("active"); }
function closeUploadKnowledgeModal() { document.getElementById("uploadKnowledgeModal").classList.remove("active"); document.getElementById("uploadKnowledgeForm").reset(); }

async function handleUploadKnowledge(e) {
    e.preventDefault();
    const uploadBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(uploadBtn, true);
    const title = document.getElementById("knowledgeTitle").value;
    const description = document.getElementById("knowledgeDescription").value;
    const file = document.getElementById("knowledgeFile").files[0];

    if (!file) {
        showError("Por favor, selecione um arquivo.");
        setButtonLoading(uploadBtn, false);
        return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        try {
            await database.ref("knowledge").push({
                title, description, fileName: file.name, fileContent: reader.result,
                uploadedAt: new Date().toISOString()
            });
            showSuccess("Arquivo enviado com sucesso!");
            closeUploadKnowledgeModal();
        } catch (error) {
            showError("Falha no upload. O arquivo pode ser muito grande.");
        } finally {
            setButtonLoading(uploadBtn, false);
        }
    };
    reader.onerror = () => { showError("Erro ao ler o arquivo."); setButtonLoading(uploadBtn, false); };
}


async function loadKnowledgeBase() {
    const knowledgeRef = database.ref("knowledge");
    knowledgeRef.on("value", (snapshot) => {
        const items = snapshot.val();
        const listDiv = document.getElementById("knowledgeList");
        if (!listDiv) return;
        listDiv.innerHTML = "";
        if (items) {
            Object.keys(items).forEach(key => {
                const item = items[key];
                const card = document.createElement('div');
                card.className = 'knowledge-card';
                card.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p><a href="${item.fileContent}" download="${item.fileName}" class="btn-secondary"><i class="fas fa-download"></i> Baixar ${item.fileName}</a>`;
                listDiv.appendChild(card);
            });
        } else {
            listDiv.innerHTML = `<div class="empty-state"><i class="fas fa-brain"></i><p>Nenhum item de conhecimento disponível.</p></div>`;
        }
    });
}