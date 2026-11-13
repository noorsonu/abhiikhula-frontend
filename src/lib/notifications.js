"use client";

/**
 * Request notification permissions and trigger turn alerts
 */
export async function requestTurnNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function notifyTurnArrival(shopName, tokenDisplay) {
  if (typeof window === 'undefined') return;

  // 1. Native Web Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification("Your Turn at the Counter! 🔔", {
        body: `Token ${tokenDisplay} is being called now at ${shopName || 'Store'}. Please proceed to the service counter.`,
        icon: '/favicon.ico',
        tag: 'turn-alert-' + tokenDisplay,
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }
  }

  // 2. Mobile Device Vibration (haptic feedback)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([300, 150, 300, 150, 400]);
    } catch (e) {}
  }
}

