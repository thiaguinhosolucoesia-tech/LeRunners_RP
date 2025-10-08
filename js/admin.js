async function loadAdminDashboard() {
    showLoading(true);
    document.getElementById("adminWelcome").textContent = `Olá, ${window.appState.currentUser.name || 'Admin'}!`;
    
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('uploadKnowledgeForm').addEventListener('submit', handleUploadKnowledge);
    
    await loadAdminUsers();
    await loadKnowledgeBase();
    showLoading(false);
}

function showAdminTab(tabName) {
    document.querySelectorAll("#adminDashboard .dash-tab-btn").forEach(btn => btn.classList.remove("active"));
    const clickedButton = Array.from(document.querySelectorAll("#adminDashboard .dash-tab-btn")).find(btn => btn.getAttribute('onclick').includes(`'${tabName}'`));
    if (clickedButton) clickedButton.classList.add("active");

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

                const userCard = document.createElement("div");
                userCard.className = "stat-card";
                userCard.innerHTML = `<div class="stat-info"><h3>${user.name}</h3><p>${user.email} | Tipo: ${user.type}</p></div>`;
                usersListDiv.appendChild(userCard);
            });
        }
        document.getElementById("totalUsers").textContent = totalUsers;
        document.getElementById("totalProfessors").textContent = totalProfessors;
        document.getElementById("totalAthletesAdmin").textContent = totalAthletes;
    });
}

function showAddUserModal() { document.getElementById("addUserModal").classList.add("active"); }
function closeAddUserModal() { document.getElementById("addUserModal").classList.remove("active"); document.getElementById("addUserForm").reset(); }

async function handleAddUser(e) {
    e.preventDefault();
    const addUserBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(addUserBtn, true);

    const name = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const password = document.getElementById("newUserPassword").value;
    const type = document.getElementById("newUserType").value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await database.ref(`users/${user.uid}`).set({ name, email, type, createdAt: new Date().toISOString() });
        showSuccess(`Usuário ${name} (${type}) adicionado com sucesso!`);
        closeAddUserModal();
    } catch (error) {
        showError(getErrorMessage(error));
    } finally {
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

    try {
        const storageRef = storage.ref(`knowledge/${Date.now()}_${file.name}`);
        const uploadTask = await storageRef.put(file);
        const fileURL = await uploadTask.ref.getDownloadURL();

        await database.ref("knowledge").push({
            title, description, fileURL, fileName: file.name,
            uploadedBy: window.appState.currentUser.uid,
            uploadedAt: new Date().toISOString()
        });
        showSuccess("Arquivo enviado com sucesso!");
        closeUploadKnowledgeModal();
    } catch (error) {
        console.error("Erro no upload:", error);
        showError("Falha no upload. Verifique as regras de segurança do Firebase Storage.");
    } finally {
        setButtonLoading(uploadBtn, false);
    }
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
                const itemCard = document.createElement('div');
                itemCard.className = 'stat-card';
                itemCard.innerHTML = `
                    <div class="stat-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <a href="${item.fileURL}" target="_blank" rel="noopener noreferrer">Ver / Baixar ${item.fileName}</a>
                    </div>`;
                listDiv.appendChild(itemCard);
            });
        } else {
            listDiv.innerHTML = "<p>Nenhum item de conhecimento encontrado.</p>";
        }
    });
}