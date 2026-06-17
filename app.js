// Supabase Configuration
const SUPABASE_URL = 'https://zmkeakeqvzhijheqqykq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5UMq2_CXbK3Bf3N9RuvOSQ_EU4wQ9k0';

let db;
const grid = document.getElementById('server-grid');
const totalEl = document.getElementById('total-count');
const onlineEl = document.getElementById('online-count');
const offlineEl = document.getElementById('offline-count');
const lastUpdatedEl = document.getElementById('last-updated');

async function init() {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    fetchData();
    setInterval(fetchData, 10000);
}

async function fetchData() {
    try {
        const { data, error } = await db.from('server_status').select('*').order('name');
        if (error) throw error;
        renderData(data);
        lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

function renderData(servers) {
    if (!servers || servers.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #8b949e;">No servers found.</div>';
        return;
    }

    let onlineCount = 0; let offlineCount = 0;
    const html = servers.map(server => {
        const isOnline = server.is_online;
        if (isOnline) onlineCount++; else offlineCount++;
        const statusClass = isOnline ? 'status-online' : 'status-offline';
        const statusText = isOnline ? 'Online' : 'Offline';
        return `
            <div class="server-card">
                <div class="card-header">
                    <span class="server-name">${server.name}</span>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <span class="server-ip">${server.ip}</span>
                <span class="server-time">Checked: ${new Date(server.last_checked).toLocaleTimeString()}</span>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;
    totalEl.textContent = servers.length;
    onlineEl.textContent = onlineCount;
    offlineEl.textContent = offlineCount;
}

// Push notification request
document.getElementById('notify-btn').addEventListener('click', () => {
    if (window.OneSignal) window.OneSignal.Notifications.requestPermission();
});

// Security Login Logic
const loginOverlay = document.getElementById('login-overlay');
const authBtn = document.getElementById('auth-btn');
const authPassword = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');

function attemptLogin() {
    if (authPassword.value === 'ping123') { 
        loginOverlay.style.display = 'none';
        init(); // Start fetching data ONLY after successful login
    } else {
        authError.style.display = 'block';
    }
}

authBtn.addEventListener('click', attemptLogin);
authPassword.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });
