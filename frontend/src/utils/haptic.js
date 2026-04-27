/**
 * Haptic Feedback Utility
 * Uses the Web Vibration API
 */

export const vibrate = (pattern) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const hapticPatterns = {
  short: 50,
  medium: 200,
  alert: [200, 100, 200],
  success: [100, 50, 100],
  error: [50, 50, 50, 50, 100]
};

export const triggerHaptic = (type) => {
  const pattern = hapticPatterns[type] || hapticPatterns.medium;
  vibrate(pattern);
};
