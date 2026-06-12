// Service Worker for JAMB Simulator PWA
const CACHE_NAME = 'jamb-simulator-v1';
const API_CACHE_NAME = 'jamb-api-v1';

const urlsToCache = [
    '/',
    '/index.html',
    '/home.html',
    '/auth.html',
    '/practice.html',
    '/flashcards.html',
    '/progress.html',
    '/planner.html',
    '/achievements.html',
    '/leaderboard.html',
    '/calculator.html',
    '/exam.html',
    '/results.html',
    '/admin.html',
    '/css/style.css',
    '/js/main.js',
    '/js/auth.js',
    '/js/admin.js',
    '/js/exam.js',
    '/js/practice.js',
    '/js/flashcards.js',
    '/js/progress.js',
    '/js/results.js',
    '/js/planner.js',
    '/js/achievements.js',
    '/js/leaderboard.js',
    '/js/calculator.js',
    '/js/streak.js',
    '/js/share.js',
    '/js/motivation.js',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('App shell cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // API requests - network first, then cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache successful API responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline - return cached API response
                    return caches.match(event.request).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Return offline fallback for API
                        return new Response(
                            JSON.stringify({ error: 'You are offline', offline: true }),
                            { status: 503, headers: { 'Content-Type': 'application/json' } }
                        );
                    });
                })
        );
        return;
    }
    
    // Static assets - cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Not in cache - fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone and cache the response
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                        
                        return response;
                    })
                    .catch(() => {
                        // If HTML request fails, return offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        
                        // For images, return a placeholder
                        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                            return new Response(
                                '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#667eea"/><text x="50" y="115" fill="white" font-size="20">Image</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                        
                        return new Response('Offline content unavailable', { status: 503 });
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-practice-results') {
        event.waitUntil(syncPracticeResults());
    }
    
    if (event.tag === 'sync-flashcard-progress') {
        event.waitUntil(syncFlashcardProgress());
    }
});

async function syncPracticeResults() {
    try {
        const db = await openIndexedDB();
        const pendingResults = await db.getAll('pendingResults');
        
        for (const result of pendingResults) {
            try {
                const response = await fetch('/api/practice/save', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${result.token}`
                    },
                    body: JSON.stringify(result.data)
                });
                
                if (response.ok) {
                    await db.delete('pendingResults', result.id);
                }
            } catch (error) {
                console.error('Sync failed for result:', result.id, error);
            }
        }
    } catch (error) {
        console.error('Background sync error:', error);
    }
}

async function syncFlashcardProgress() {
    try {
        const db = await openIndexedDB();
        const pendingProgress = await db.getAll('pendingFlashcards');
        
        for (const progress of pendingProgress) {
            try {
                const response = await fetch('/api/flashcards/progress', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${progress.token}`
                    },
                    body: JSON.stringify(progress.data)
                });
                
                if (response.ok) {
                    await db.delete('pendingFlashcards', progress.id);
                }
            } catch (error) {
                console.error('Sync failed for flashcard:', progress.id, error);
            }
        }
    } catch (error) {
        console.error('Flashcard sync error:', error);
    }
}

// IndexedDB helper
async function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('JAMBAppOffline', 2);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            resolve({
                getAll: (storeName) => {
                    return new Promise((res, rej) => {
                        const tx = db.transaction(storeName, 'readonly');
                        const store = tx.objectStore(storeName);
                        const request = store.getAll();
                        request.onsuccess = () => res(request.result);
                        request.onerror = () => rej(request.error);
                    });
                },
                delete: (storeName, id) => {
                    return new Promise((res, rej) => {
                        const tx = db.transaction(storeName, 'readwrite');
                        const store = tx.objectStore(storeName);
                        const request = store.delete(id);
                        request.onsuccess = () => res();
                        request.onerror = () => rej(request.error);
                    });
                }
            });
        };
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('pendingResults')) {
                db.createObjectStore('pendingResults', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('pendingFlashcards')) {
                db.createObjectStore('pendingFlashcards', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('cachedQuestions')) {
                const questionStore = db.createObjectStore('cachedQuestions', { keyPath: 'id' });
                questionStore.createIndex('subject', 'subject_id', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('userSettings')) {
                db.createObjectStore('userSettings', { keyPath: 'key' });
            }
        };
    });
}

// Push notifications
self.addEventListener('push', event => {
    console.log('Push notification received:', event);
    
    let data = { title: 'JAMB Simulator', body: 'Time to study!', icon: '/icons/icon-192x192.png' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icons/check.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/cross.png'
            }
        ],
        tag: 'jamb-reminder',
        renotify: true
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'JAMB Simulator', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Check if there's already a window open
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                return clients.openWindow(urlToOpen);
            })
    );
});

// Periodic sync (for future updates)
self.addEventListener('periodicsync', event => {
    console.log('Periodic sync triggered:', event.tag);
    
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const requests = [
            '/api/subjects',
            '/api/popular-questions'
        ];
        
        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    cache.put(request, response);
                }
            } catch (error) {
                console.error('Failed to update:', request, error);
            }
        }
    } catch (error) {
        console.error('Periodic sync error:', error);
    }
}

// Message event for client communication
self.addEventListener('message', event => {
    console.log('Message received from client:', event.data);
    
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

// Handle offline analytics
self.addEventListener('sync', event => {
    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    const db = await openIndexedDB();
    const analytics = await db.getAll('pendingAnalytics');
    
    for (const item of analytics) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
            });
            await db.delete('pendingAnalytics', item.id);
        } catch (error) {
            console.error('Analytics sync failed:', error);
        }
    }
}