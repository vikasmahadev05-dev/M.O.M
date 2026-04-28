// public/sw.js
// Service Worker for M.O.M Web Push Notifications

self.addEventListener('push', (event) => {
  let data = { title: 'M.O.M Sanctuary', body: 'You have a new reminder.', icon: '/favicon.svg' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'Open Sanctuary' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open the app when the notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});
