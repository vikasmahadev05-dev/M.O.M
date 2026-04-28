import { useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const VAPID_PUBLIC_KEY = 'BO_jRrIyo1nHQdao3naZZaTw_9FJKTS4v9XO1pyyIZaCdLfNn4bKCZxuGhU-y3u9MtmFz-ij4Jf3vRtvbT4F8CY';

const usePushNotifications = () => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const registerAndSubscribe = async () => {
      try {
        // 1. Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);

        // 2. Wait for registration to be ready
        await navigator.serviceWorker.ready;

        // 3. Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // 4. Subscribe user
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        }

        // 5. Send subscription to backend
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        await axios.post(`${API_BASE_URL}/api/notifications/subscribe`, 
          { subscription }, 
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        console.log('Push notification subscription successful.');
      } catch (error) {
        console.error('Push registration/subscription failed:', error);
      }
    };

    registerAndSubscribe();
  }, [user]);
};

// Helper to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
