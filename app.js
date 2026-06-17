// Supabase Configuration
const SUPABASE_URL = 'https://zmkeakeqvzhijheqqykq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5UMq2_CXbK3Bf3N9RuvOSQ_EU4wQ9k0';

let db;

// DOM Elements
const grid = document.getElementById('server-grid');
const totalEl = document.getElementById('total-count');
const onlineEl = document.getElementById('online-count');
const offlineEl = document.getElementById('offline-count');
const lastUpdatedEl = document.getElementById('last-updated');

async function init() {
    // Initialize Supabase if keys are provided
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        fetchData();
        // Setup polling every 10 seconds (easier than setting up Postgres replication for real-time initially)
        setInterval(fetchData, 10000);
    } else {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #8b949e;">Please configure your Supabase URL and Anon Key in app.js</div>';
    }
}

async function fetchData() {
    try {
        const { data, error } = await db
            .from('server_status')
            .select('*')
            .order('name');

        if (error) throw error;
        
        renderData(data);
        
        // Update last updated text
        const now = new Date();
        lastUpdatedEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

function renderData(servers) {
    if (!servers || servers.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #8b949e;">No servers found in database. Start your pingbot.py!</div>';
        return;
    }

    let onlineCount = 0;
    let offlineCount = 0;
    
    const html = servers.map(server => {
        const isOnline = server.is_online;
        if (isOnline) onlineCount++;
        else offlineCount++;

        const statusClass = isOnline ? 'status-online' : 'status-offline';
        const statusText = isOnline ? 'Online' : 'Offline';
        const updatedDate = new Date(server.last_checked);
        
        return `
            <div class="server-card">
                <div class="card-header">
                    <span class="server-name">${server.name}</span>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <span class="server-ip">${server.ip}</span>
                <span class="server-time">Checked: ${updatedDate.toLocaleTimeString()}</span>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;
    
    // Update top stats
    totalEl.textContent = servers.length;
    onlineEl.textContent = onlineCount;
    offlineEl.textContent = offlineCount;
}

// Push notification request handler
document.getElementById('notify-btn').addEventListener('click', () => {
    if (window.OneSignal) {
        window.OneSignal.showNativePrompt();
    } else {
        alert("OneSignal is not initialized yet. Ensure you've replaced the App ID in index.html");
    }
});

// Start app
init();
