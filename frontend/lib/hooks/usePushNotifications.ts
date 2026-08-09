import { useState, useEffect } from 'react';
import api from '../api';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      // Use a timeout to prevent infinite hang if service worker never becomes ready
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      checkSubscription().finally(() => clearTimeout(timeout));
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
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
  };

  const subscribe = async () => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission denied');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // In a real app, you would fetch the VAPID public key from the backend here
      // For this implementation, we use a mock key just to get the subscription object
      const mockVapidPublicKey = "BJ5IxJBWdeqFDJTvrZ4wNRu7B2TxC4w_k-t5K-FhE0dC5aJp8c7XwK1Pj2-Kk8iUfJ5bZl2dJ8Q-Z5bZl2dJ8Q"; 
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(mockVapidPublicKey)
      });

      // Send the subscription to your backend
      // await api.post('/notifications/subscribe', subscription);
      
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        // Tell backend to remove subscription
        // await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
        setIsSubscribed(false);
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  };
}
