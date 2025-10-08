// Funções de autenticação
async function loginUser(email, password) {
    try {
        showLoading(true);

        if (email === MASTER_ADMIN_CREDENTIALS.email && password === MASTER_ADMIN_CREDENTIALS.password) {
            window.appState.currentUser = { uid: "master_admin", email: email, name: "Administrador Mestre", type: "admin" };
            window.appState.userType = "admin";
            await showDashboard("admin");
            return true;
        }

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
        
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            window.appState.currentUser = { uid: user.uid, email: user.email, name: userData.name, type: userData.type };
            window.appState.userType = userData.type;
            await showDashboard(userData.type);
            return true;
        } else {
            await auth.signOut();
            throw new Error('Dados do usuário não encontrados.');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showError(getErrorMessage(error));
        return false;
    } finally {
        showLoading(false);
    }
}

async function logout() {
    try {
        await auth.signOut();
        window.appState = { currentUser: null, userType: null, athletes: [], activities: [], stravaConnected: false, stravaData: null, knowledgeBase: [] };
        showScreen('loginScreen');
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        if(window.appState.currentUser) return; // Previne recarregamento desnecessário
        const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            window.appState.currentUser = { uid: user.uid, email: user.email, name: userData.name, type: userData.type };
            window.appState.userType = userData.type;
            await showDashboard(userData.type);
        } else {
            await logout();
        }
    } else {
        showScreen('loginScreen');
    }
});

function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password': return 'Email ou senha incorretos';
        case 'auth/invalid-email': return 'Email inválido';
        default: return error.message || 'Erro desconhecido';
    }
}