const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAvNlifcwHV6qPh9cKCJTQoJM2bMkGl2HQ",
    authDomain: "lerunners-4725f.firebaseapp.com",
    databaseURL: "https://lerunners-4725f-default-rtdb.firebaseio.com",
    projectId: "lerunners-4725f",
    storageBucket: "lerunners-4725f.appspot.com",
    messagingSenderId: "490740324975",
    appId: "1:490740324975:web:c354dcdcd334c049a58b9a"
};

const STRAVA_CONFIG = {
    clientId: "180023",
    clientSecret: "b9e9c18254fe229af3a7e95a995c0c94b22d41ff",
    redirectUri: window.location.origin + window.location.pathname,
    scope: 'read,activity:read_all,profile:read_all',
    authUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: 'https://www.strava.com/oauth/token',
    apiUrl: 'https://www.strava.com/api/v3'
};

const MASTER_ADMIN_CREDENTIALS = {
    email: "admin@lerunners.com",
    password: "admin123"
};

// Referências globais
let auth;
let database;
let storage;

// Estado global
window.appState = {
    currentUser: null,
    userType: null,
    athletes: [],
    activities: [],
    stravaConnected: false,
    stravaData: null,
    knowledgeBase: []
};