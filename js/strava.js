// ** FUNÇÕES DE INTEGRAÇÃO COM A API DO STRAVA **

// Constrói a URL de autorização do Strava
function getStravaAuthUrl() {
    const params = new URLSearchParams({
        client_id: STRAVA_CONFIG.clientId,
        redirect_uri: STRAVA_CONFIG.redirectUri,
        response_type: 'code',
        scope: STRAVA_CONFIG.scope,
        approval_prompt: 'force'
    });
    return `${STRAVA_CONFIG.authUrl}?${params.toString()}`;
}

// Redireciona o usuário para a página de autorização do Strava
function connectStrava() {
    window.location.href = getStravaAuthUrl();
}

// Verifica se há um código de autorização na URL (após o retorno do Strava)
async function checkForStravaCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        showLoading(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        await handleStravaCallback(code);
        showLoading(false);
    }
}

// Lida com o código de retorno, trocando-o por um token de acesso
async function handleStravaCallback(code) {
    try {
        const response = await fetch(STRAVA_CONFIG.tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: STRAVA_CONFIG.clientId,
                client_secret: STRAVA_CONFIG.clientSecret,
                code: code,
                grant_type: 'authorization_code'
            })
        });
        const tokenData = await response.json();
        if (!response.ok) throw new Error(tokenData.message || 'Erro desconhecido do Strava');

        const stravaInfo = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_at,
            athleteId: tokenData.athlete.id,
            athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`
        };

        await database.ref(`users/${window.appState.currentUser.uid}/strava`).set(stravaInfo);
        window.appState.stravaData = stravaInfo;
        showSuccess('Conta Strava conectada com sucesso!');
        updateStravaUICard();
    } catch (error) {
        showError('Erro ao conectar com Strava: ' + error.message);
    }
}

// Verifica a conexão existente e atualiza a UI
async function checkStravaConnection() {
    // Apenas executa se estiver no dashboard de atleta
    if(document.getElementById('atletaDashboard').classList.contains('active')){
        const stravaRef = database.ref(`users/${window.appState.currentUser.uid}/strava`);
        const snapshot = await stravaRef.once('value');
        window.appState.stravaData = snapshot.exists() ? snapshot.val() : null;
        
        updateStravaUICard();
        await checkForStravaCode();
    }
}

// Renderiza o card do Strava no painel do atleta
function updateStravaUICard() {
    const cardDiv = document.getElementById('stravaCard');
    if (!cardDiv) return;

    if (window.appState.stravaData) {
        cardDiv.innerHTML = `
            <div class="strava-connected">
                <i class="fab fa-strava"></i>
                <h3>Conectado ao Strava</h3>
                <p>Você está conectado como <strong>${window.appState.stravaData.athleteName}</strong>.</p>
                <small>Suas atividades serão sincronizadas em breve.</small>
            </div>
        `;
    } else {
        cardDiv.innerHTML = `
            <div class="strava-disconnected">
                <i class="fab fa-strava"></i>
                <h3>Conectar com Strava</h3>
                <p>Importe suas atividades e acompanhe seu progresso de forma automática.</p>
                <button id="connectStravaBtn" class="btn-strava"><i class="fab fa-strava"></i> Conectar com Strava</button>
            </div>
        `;
    }
}