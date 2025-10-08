async function loadAdminDashboard() {
    showLoading(true);
    document.getElementById("adminWelcome").textContent = `Olá, ${window.appState.currentUser.name || 'Administrador'}!`;
    await loadAdminUsers();
    await loadKnowledgeBase();
    showLoading(false);
}

function showAdminTab(tabName) {
    document.querySelectorAll(".dashboard-tabs .dash-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    event.target.classList.add("active");

    document.querySelectorAll("#adminDashboard .dash-tab-content").forEach(content => {
        content.classList.remove("active");
    });
    document.getElementById(`admin${tabName}Tab`).classList.add("active");
}

// Gerenciamento de Usuários (Admin)
async function loadAdminUsers() {
    const usersRef = database.ref("users");
    usersRef.on("value", (snapshot) => {
        const users = snapshot.val();
        const usersListDiv = document.getElementById("adminUsersList");
        usersListDiv.innerHTML = "";
        let totalUsers = 0;
        let totalProfessors = 0;
        let totalAthletes = 0;

        if (users) {
            Object.keys(users).forEach(uid => {
                const user = users[uid];
                if (user.type === "admin") return; // Não listar o admin mestre aqui

                totalUsers++;
                if (user.type === "professor") totalProfessors++;
                if (user.type === "atleta") totalAthletes++;

                const userCard = document.createElement("div");
                userCard.className = "athlete-card";
                userCard.innerHTML = `
                    <div class="athlete-avatar">
                        <i class="fas ${user.type === 'professor' ? 'fa-user-tie' : 'fa-running'}"></i>
                    </div>
                    <div class="athlete-info">
                        <h3>${user.name}</h3>
                        <p>${user.email}</p>
                        <p>Tipo: ${user.type === 'professor' ? 'Professor' : 'Atleta'}</p>
                    </div>
                    <div class="athlete-actions">
                        <button class="btn-secondary" onclick="editUser('${uid}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-danger" onclick="deleteUser('${uid}')"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                usersListDiv.appendChild(userCard);
            });
        }

        document.getElementById("totalUsers").textContent = totalUsers;
        document.getElementById("totalProfessors").textContent = totalProfessors;
        document.getElementById("totalAthletesAdmin").textContent = totalAthletes;

        if (totalUsers === 0) {
            usersListDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Nenhum usuário cadastrado ainda.</p>
                    <small>Adicione professores e atletas à plataforma.</small>
                    <button class="btn-primary" onclick="showAddUserModal()">
                        <i class="fas fa-user-plus"></i> Adicionar Primeiro Usuário
                    </button>
                </div>
            `;
        }
    });
}

function showAddUserModal() {
    document.getElementById("addUserModal").classList.add("active");
}

function closeAddUserModal() {
    document.getElementById("addUserModal").classList.remove("active");
    document.getElementById("addUserForm").reset();
}

async function handleAddUser(e) {
    e.preventDefault();
    showLoading(true);

    const name = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const password = document.getElementById("newUserPassword").value;
    const type = document.getElementById("newUserType").value;

    try {
        // Criar usuário no Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Salvar dados adicionais no Realtime Database
        await database.ref(`users/${user.uid}`).set({
            name: name,
            email: email,
            type: type,
            createdAt: new Date().toISOString()
        });

        showSuccess(`Usuário ${name} (${type}) adicionado com sucesso!`);
        closeAddUserModal();
    } catch (error) {
        console.error("Erro ao adicionar usuário:", error);
        showError(getErrorMessage(error));
    } finally {
        showLoading(false);
    }
}

async function deleteUser(uid) {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) {
        return;
    }
    showLoading(true);
    try {
        // Para excluir um usuário do Firebase Auth, é necessário um processo de backend ou reautenticação.
        // Para simplificar no frontend, vamos apenas remover do Realtime Database.
        // Em um ambiente real, a exclusão do Auth deveria ser feita por uma Cloud Function ou backend.
        await database.ref(`users/${uid}`).remove();
        showSuccess("Usuário removido com sucesso do banco de dados!");
    } catch (error) {
        console.error("Erro ao remover usuário:", error);
        showError("Erro ao remover usuário: " + error.message);
    } finally {
        showLoading(false);
    }
}

// Gestão de Conhecimento (Admin)
function showUploadKnowledgeModal() {
    document.getElementById("uploadKnowledgeModal").classList.add("active");
}

function closeUploadKnowledgeModal() {
    document.getElementById("uploadKnowledgeModal").classList.remove("active");
    document.getElementById("uploadKnowledgeForm").reset();
}

async function handleUploadKnowledge(e) {
    e.preventDefault();
    showLoading(true);

    const title = document.getElementById("knowledgeTitle").value;
    const description = document.getElementById("knowledgeDescription").value;
    const fileInput = document.getElementById("knowledgeFile");
    const file = fileInput.files[0];

    if (!file) {
        showError("Por favor, selecione um arquivo para upload.");
        showLoading(false);
        return;
    }

    try {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`knowledge/${file.name}`);
        await fileRef.put(file);
        const fileURL = await fileRef.getDownloadURL();

        await database.ref("knowledge").push({
            title: title,
            description: description,
            fileURL: fileURL,
            fileName: file.name,
            uploadedBy: window.appState.currentUser.uid,
            uploadedAt: new Date().toISOString()
        });

        showSuccess("Arquivo de conhecimento enviado com sucesso!");
        closeUploadKnowledgeModal();
        await loadKnowledgeBase(); // Recarregar lista de conhecimentos
    } catch (error) {
        console.error("Erro ao fazer upload de conhecimento:", error);
        showError("Erro ao fazer upload: " + error.message);
    } finally {
        showLoading(false);
    }
}

async function loadKnowledgeBase() {
    const knowledgeRef = database.ref("knowledge");
    knowledgeRef.on("value", (snapshot) => {
        const knowledgeItems = snapshot.val();
        const knowledgeListAdmin = document.getElementById("knowledgeList");
        const knowledgeListAthlete = document.getElementById("knowledgeListAthlete");
        const knowledgeListProfessor = document.getElementById("knowledgeListProfessor");

        knowledgeListAdmin.innerHTML = "";
        knowledgeListAthlete.innerHTML = "";
        knowledgeListProfessor.innerHTML = "";

        if (knowledgeItems) {
            Object.keys(knowledgeItems).forEach(key => {
                const item = knowledgeItems[key];
                const knowledgeCard = `
                    <div class="knowledge-card">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <a href="${item.fileURL}" target="_blank" class="btn-secondary"><i class="fas fa-download"></i> ${item.fileName}</a>
                        ${window.appState.userType === 'admin' ? `<button class="btn-danger" onclick="deleteKnowledgeItem('${key}')"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                `;
                knowledgeListAdmin.innerHTML += knowledgeCard;
                knowledgeListAthlete.innerHTML += knowledgeCard;
                knowledgeListProfessor.innerHTML += knowledgeCard;
            });
        } else {
            const emptyState = `
                <div class="empty-state">
                    <i class="fas fa-brain"></i>
                    <p>Nenhum item de conhecimento disponível.</p>
                </div>
            `;
            knowledgeListAdmin.innerHTML = emptyState;
            knowledgeListAthlete.innerHTML = emptyState;
            knowledgeListProfessor.innerHTML = emptyState;
        }
    });
}

async function deleteKnowledgeItem(key) {
    if (!confirm("Tem certeza que deseja excluir este item de conhecimento?")) {
        return;
    }
    showLoading(true);
    try {
        const knowledgeRef = database.ref(`knowledge/${key}`);
        const snapshot = await knowledgeRef.once('value');
        const item = snapshot.val();

        // Excluir arquivo do Storage
        const storageRef = firebase.storage().refFromURL(item.fileURL);
        await storageRef.delete();

        // Excluir registro do Database
        await knowledgeRef.remove();
        showSuccess("Item de conhecimento removido com sucesso!");
    } catch (error) {
        console.error("Erro ao remover item de conhecimento:", error);
        showError("Erro ao remover item: " + error.message);
    } finally {
        showLoading(false);
    }
}

function showViewKnowledgeModal(title, description, fileURL) {
    document.getElementById("viewKnowledgeTitle").textContent = title;
    document.getElementById("viewKnowledgeDescription").textContent = description;
    document.getElementById("viewKnowledgeIframe").src = fileURL;
    document.getElementById("viewKnowledgeModal").classList.add("active");
}

function closeViewKnowledgeModal() {
    document.getElementById("viewKnowledgeModal").classList.remove("active");
    document.getElementById("viewKnowledgeIframe").src = ""; // Limpar iframe
}

