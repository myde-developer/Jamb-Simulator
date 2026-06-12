// PWA Registration and Utilities

// Check if service worker is supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        registerServiceWorker();
        requestNotificationPermission();
    });
}

// Register service worker
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        
        console.log('ServiceWorker registered successfully:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('New service worker installing...');
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateNotification();
                }
            });
        });
        
        // Set up periodic sync if supported
        if ('periodicSync' in registration) {
            registerPeriodicSync(registration);
        }
        
        return registration;
        
    } catch (error) {
        console.error('ServiceWorker registration failed:', error);
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                    scheduleStudyReminders();
                }
            });
        }
    }
}

// Schedule study reminders
function scheduleStudyReminders() {
    const registration = await navigator.serviceWorker.ready;
    
    // Show notification immediately for testing
    registration.showNotification('JAMB Simulator', {
        body: 'Time for your daily study session!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.png',
        vibrate: [200, 100, 200],
        tag: 'study-reminder',
        renotify: true,
        actions: [
            { action: 'study', title: 'Start Studying' },
            { action: 'later', title: 'Remind Later' }
        ]
    });
}

// Register periodic sync
async function registerPeriodicSync(registration) {
    try {
        const status = await navigator.permissions.query({
            name: 'periodic-background-sync',
        });
        
        if (status.state === 'granted') {
            await registration.periodicSync.register('update-content', {
                minInterval: 24 * 60 * 60 * 1000, // 1 day
            });
            console.log('Periodic sync registered');
        }
    } catch (error) {
        console.error('Periodic sync registration failed:', error);
    }
}

// Show update notification
function showUpdateNotification() {
    const updateDiv = document.createElement('div');
    updateDiv.className = 'pwa-update-notification';
    updateDiv.innerHTML = `
        <div class="update-content">
            <span class="update-icon">🔄</span>
            <span class="update-text">New version available!</span>
            <button class="update-btn" onclick="applyUpdate()">Update</button>
        </div>
    `;
    document.body.appendChild(updateDiv);
    
    setTimeout(() => updateDiv.classList.add('show'), 100);
}

// Apply update
window.applyUpdate = function() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('skipWaiting');
        
        // Wait for new service worker to activate
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
};

// Check if app is installable
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button
    showInstallButton();
});

function showInstallButton() {
    const installDiv = document.createElement('div');
    installDiv.className = 'pwa-install-prompt';
    installDiv.innerHTML = `
        <div class="install-content">
            <span class="install-icon">📱</span>
            <span class="install-text">Install JAMB Simulator on your device</span>
            <button class="install-btn" onclick="promptInstall()">Install</button>
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">✖</button>
        </div>
    `;
    document.body.appendChild(installDiv);
    
    setTimeout(() => installDiv.classList.add('show'), 100);
}

// Prompt install
window.promptInstall = async function() {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the saved prompt
    deferredPrompt = null;
    
    // Remove install button
    const installPrompt = document.querySelector('.pwa-install-prompt');
    if (installPrompt) installPrompt.remove();
};

// Detect if app is running in standalone mode
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is running in standalone mode');
    document.body.classList.add('pwa-mode');
}

// Network status monitoring
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log(`Network status: ${status}`);
    
    const statusIndicator = document.getElementById('network-status');
    if (statusIndicator) {
        statusIndicator.className = `network-status ${status}`;
        statusIndicator.textContent = status === 'online' ? '🟢 Online' : '🔴 Offline';
    }
    
    if (status === 'online') {
        syncOfflineData();
    }
}

// Sync offline data when back online
async function syncOfflineData() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        try {
            await registration.sync.register('sync-practice-results');
            await registration.sync.register('sync-flashcard-progress');
            await registration.sync.register('sync-analytics');
            console.log('Background sync registered');
        } catch (error) {
            console.error('Background sync registration failed:', error);
        }
    }
}

// Add network status indicator to page
function addNetworkIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'network-status';
    indicator.className = `network-status ${navigator.onLine ? 'online' : 'offline'}`;
    indicator.textContent = navigator.onLine ? '🟢 Online' : '🔴 Offline';
    document.body.appendChild(indicator);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addNetworkIndicator();
    updateNetworkStatus();
    
    // Check if this is first visit
    if (!localStorage.getItem('pwaInstalled')) {
        // Track install stats
        localStorage.setItem('pwaInstalled', 'true');
    }
});

// Add CSS for PWA elements
const style = document.createElement('style');
style.textContent = `
    .pwa-update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 50px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        transform: translateY(100px);
        transition: transform 0.3s ease;
        z-index: 10000;
    }
    
    .pwa-update-notification.show {
        transform: translateY(0);
    }
    
    .update-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .update-icon {
        font-size: 1.5rem;
    }
    
    .update-btn {
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    }
    
    .update-btn:hover {
        transform: scale(1.05);
    }
    
    .pwa-install-prompt {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 15px;
        box-shadow: 0 5px 30px rgba(0,0,0,0.2);
        transform: translateY(200px);
        transition: transform 0.3s ease;
        z-index: 10000;
        max-width: 400px;
        margin: 0 auto;
    }
    
    .pwa-install-prompt.show {
        transform: translateY(0);
    }
    
    .install-content {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .install-icon {
        font-size: 2rem;
    }
    
    .install-text {
        flex: 1;
        color: #333;
        font-weight: 500;
    }
    
    .install-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    }
    
    .install-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #999;
        padding: 5px;
    }
    
    .close-btn:hover {
        color: #e74c3c;
    }
    
    .network-status {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 8px 15px;
        border-radius: 50px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .network-status.online {
        background: #d4edda;
        color: #155724;
    }
    
    .network-status.offline {
        background: #f8d7da;
        color: #721c24;
    }
    
    @media (max-width: 768px) {
        .install-content {
            flex-direction: column;
            text-align: center;
        }
        
        .network-status {
            top: 120px;
            right: 10px;
            font-size: 0.8rem;
        }
    }
`;

document.head.appendChild(style);