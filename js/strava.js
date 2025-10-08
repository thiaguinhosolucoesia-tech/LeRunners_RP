// Funções de integração com Strava API

// Gerar URL de autorização do Strava
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

// Conectar com Strava
function connectStrava() {
    window.location.href = getStravaAuthUrl();
}

// Trocar código por token de acesso
async function exchangeCodeForToken(code) {
    try {
        const response = await fetch(STRAVA_CONFIG.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: STRAVA_CONFIG.clientId,
                client_secret: STRAVA_CONFIG.clientSecret,
                code: code,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao trocar código por token');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na troca de código por token:', error);
        throw error;
    }
}

// Buscar dados do atleta
async function getAthleteData(accessToken) {
    try {
        const response = await fetch(`${STRAVA_CONFIG.apiUrl}/athlete`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar dados do atleta');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados do atleta:', error);
        throw error;
    }
}

// Buscar atividades do atleta
async function getAthleteActivities(accessToken, page = 1, perPage = 30) {
    try {
        const response = await fetch(
            `${STRAVA_CONFIG.apiUrl}/athlete/activities?page=${page}&per_page=${perPage}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao buscar atividades');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        throw error;
    }
}

// Processar callback do Strava
async function handleStravaCallback(code) {
    try {
        showLoading(true);
        
        const tokenData = await exchangeCodeForToken(code);
        const athleteData = await getAthleteData(tokenData.access_token);
        
        // Salvar dados do Strava no Firebase
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
        
        // Carregar atividades
        await loadStravaActivities(tokenData.access_token);
        
        // Atualizar UI
        updateStravaUI();
        showSuccess('Conta Strava conectada com sucesso!');
        
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } catch (error) {
        console.error('Erro ao processar callback do Strava:', error);
        showError('Erro ao conectar com Strava');
    } finally {
        showLoading(false);
    }
}

// Carregar atividades do Strava
async function loadStravaActivities(accessToken) {
    try {
        const activities = await getAthleteActivities(accessToken, 1, 20);
        window.appState.activities = activities;
        
        // Salvar atividades no Firebase para cache
        await database.ref(`users/${window.appState.currentUser.uid}/activities`).set({
            data: activities,
            lastSync: new Date().toISOString()
        });
        
        updateActivitiesUI();
        updateStatsUI();
        
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        showError('Erro ao carregar atividades do Strava');
    }
}

// Sincronizar atividades do Strava
async function syncStrava() {
    if (!window.appState.stravaConnected || !window.appState.stravaData) {
        showError('Strava não conectado');
        return;
    }
    
    try {
        showLoading(true);
        await loadStravaActivities(window.appState.stravaData.accessToken);
        showSuccess('Atividades sincronizadas com sucesso!');
    } catch (error) {
        console.error('Erro ao sincronizar:', error);
        showError('Erro ao sincronizar atividades');
    } finally {
        showLoading(false);
    }
}

// Verificar conexão Strava existente
async function checkStravaConnection() {
    if (!window.appState.currentUser) return;
    
    try {
        const stravaSnapshot = await database.ref(`users/${window.appState.currentUser.uid}/strava`).once('value');
        
        if (stravaSnapshot.exists()) {
            const stravaData = stravaSnapshot.val();
            window.appState.stravaConnected = true;
            window.appState.stravaData = stravaData;
            
            // Carregar atividades em cache
            const activitiesSnapshot = await database.ref(`users/${window.appState.currentUser.uid}/activities`).once('value');
            if (activitiesSnapshot.exists()) {
                const activitiesData = activitiesSnapshot.val();
                window.appState.activities = activitiesData.data || [];
            }
            
            updateStravaUI();
            updateActivitiesUI();
            updateStatsUI();
        }
    } catch (error) {
        console.error('Erro ao verificar conexão Strava:', error);
    }
}

// Atualizar UI do Strava
function updateStravaUI() {
    const stravaConnected = document.getElementById('stravaConnected');
    const stravaDisconnected = document.getElementById('stravaDisconnected');
    const stravaAthleteNameEl = document.getElementById('stravaAthleteName');
    
    if (window.appState.stravaConnected && window.appState.stravaData) {
        stravaConnected.style.display = 'block';
        stravaDisconnected.style.display = 'none';
        if (stravaAthleteNameEl) {
            stravaAthleteNameEl.textContent = window.appState.stravaData.athleteName || '-';
        }
    } else {
        stravaConnected.style.display = 'none';
        stravaDisconnected.style.display = 'block';
    }
}

// Formatação de dados
function formatDistance(meters) {
    return (meters / 1000).toFixed(2) + ' km';
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
}
