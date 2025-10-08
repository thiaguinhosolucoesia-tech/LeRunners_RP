// Funções de autenticação

// Login do usuário
async function loginUser(email, password) {
    try {
        showLoading(true);

        // Verificar se é o Administrador Mestre
        if (email === MASTER_ADMIN_CREDENTIALS.email && password === MASTER_ADMIN_CREDENTIALS.password) {
            window.appState.currentUser = {
                uid: "master_admin", // UID fictício para o admin mestre
                email: email,
                name: "Administrador Mestre",
                type: "admin"
            };
            window.appState.userType = "admin";
            showDashboard("admin");
            return true;
        }

        // Tentar login com Firebase Authentication para outros usuários
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Buscar dados do usuário no database
        const userSnapshot = await database.ref(`users/${user.uid}`).once(\'value\');
        
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            window.appState.currentUser = {
                uid: user.uid,
                email: user.email,
                name: userData.name,
                type: userData.type
            };
            window.appState.userType = userData.type;
            
            showDashboard(userData.type);
            return true;
        } else {
            // Se o usuário existe no Auth mas não no DB, pode ser um erro ou usuário antigo
            await auth.signOut(); // Desloga para evitar inconsistência
            throw new Error(\'Dados do usuário não encontrados no banco de dados. Contate o administrador.\');
        }
    } catch (error) {
        console.error(\'Erro no login:\', error);
        showError(getErrorMessage(error));
        return false;
    } finally {
        showLoading(false);
    }
}

// Logout do usuário
async function logout() {
    try {
        await auth.signOut();
        window.appState.currentUser = null;
        window.appState.userType = null;
        window.appState.athletes = [];
        window.appState.activities = [];
        window.appState.stravaConnected = false;
        window.appState.stravaData = null;
        
        showScreen('loginScreen');
    } catch (error) {
        console.error('Erro no logout:', error);
        showError('Erro ao fazer logout');
    }
}

// Verificar estado de autenticação
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
            
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                window.appState.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    name: userData.name,
                    type: userData.type
                };
                window.appState.userType = userData.type;
                
                showDashboard(userData.type);
            } else {
                await auth.signOut();
                showScreen('loginScreen');
            }
        } catch (error) {
            console.error('Erro ao verificar usuário:', error);
            showScreen('loginScreen');
        }
    } else {
        showScreen('loginScreen');
    }
});

// Função para obter mensagem de erro amigável
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Email ou senha incorretos';
        case 'auth/email-already-in-use':
            return 'Este email já está em uso';
        case 'auth/weak-password':
            return 'A senha deve ter pelo menos 6 caracteres';
        case 'auth/invalid-email':
            return 'Email inválido';
        case 'auth/too-many-requests':
            return 'Muitas tentativas. Tente novamente mais tarde';
        default:
            return error.message || 'Erro desconhecido';
    }
}
