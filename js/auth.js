// ** FUNÇÕES DE AUTENTICAÇÃO **

// Verifica o estado de autenticação quando a aplicação carrega
function checkAuthState() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Usuário está logado no Firebase
            const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                window.appState.currentUser = { ...userData, uid: user.uid, email: user.email };
                window.appState.userType = userData.type;
                await showDashboard(userData.type);
            } else {
                // Usuário existe no Auth mas não no DB (estado inconsistente)
                logout();
            }
        } else {
            // Nenhum usuário logado
            showScreen('loginScreen');
        }
    });
}

// Executa o login
async function loginUser(email, password) {
    try {
        // Tratamento especial para o Administrador Mestre
        if (email === MASTER_ADMIN_CREDENTIALS.email && password === MASTER_ADMIN_CREDENTIALS.password) {
            window.appState.currentUser = { uid: "master_admin", email, name: "Administrador Mestre", type: "admin" };
            window.appState.userType = "admin";
            await showDashboard("admin");
            return;
        }

        // Login para usuários normais via Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        // O `onAuthStateChanged` vai detectar a mudança e chamar o showDashboard
    } catch (error) {
        console.error('Erro no login:', error);
        showError(getErrorMessage(error));
    }
}

// Executa o logout
async function logout() {
    try {
        await auth.signOut();
        window.appState.currentUser = null;
        window.appState.userType = null;
        window.location.reload(); // Recarrega para um estado limpo
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

// Traduz erros do Firebase
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
             return 'Email ou senha incorretos.';
        case 'auth/email-already-in-use':
            return 'Este email já está em uso.';
        case 'auth/weak-password':
            return 'A senha deve ter pelo menos 6 caracteres.';
        case 'auth/invalid-email':
            return 'O formato do email é inválido.';
        case 'auth/too-many-requests':
            return 'Acesso bloqueado temporariamente. Tente mais tarde.';
        default:
            return error.message || 'Ocorreu um erro desconhecido.';
    }
}