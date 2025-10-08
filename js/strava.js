// Funções de integração com Strava API
function getStravaAuthUrl() {
    const params = new URLSearchParams({
        client_id: STRAVA_CONFIG.clientId,
        redirect_uri: STRAVA_CONFIG.redirectUri,
        response_type: 'code',
        scope: STRAVA_CONFIG.scope,
        approval_prompt: 'auto'
    });
    return `${STRAVA_CONFIG.authUrl}?${params.toString()}`;
}

function connectStrava() {
    window.location.href = getStravaAuthUrl();
}

async function exchangeCodeForToken(code) {
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
        if (!response.ok) throw new Error('Erro ao trocar código por token');
        return await response.json();
    } catch (error) {
        console.error('Erro na troca de código por token:', error);
        throw error;
    }
}

async function handleStravaCallback(code) {
    try {
        showLoading(true);
        const tokenData = await exchangeCodeForToken(code);
        const athleteData = await getAthleteData(tokenData.access_token);
        const stravaInfo = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            athleteId: athleteData.id,
            athleteName: `${athleteData.firstname} ${athleteData.lastname}`,
            connectedAt: new Date().toISOString()
        };
        await database.ref(`users/${window.appState.currentUser.uid}/strava`).set(stravaInfo);
        window.appState.stravaConnected = true;
        window.appState.stravaData = stravaInfo;
        await loadStravaActivities(tokenData.access_token);
        updateStravaUI();
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        showError('Erro ao conectar com Strava');
    } finally {
        showLoading(false);
    }
}

async function getAthleteData(accessToken) { /* ... */ }
async function getAthleteActivities(accessToken) { /* ... */ }
async function loadStravaActivities(accessToken) { /* ... */ }
async function syncStrava() { /* ... */ }
async function checkStravaConnection() { /* ... */ }
function updateStravaUI() { /* ... */ }