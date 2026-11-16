"use client";

/**
 * Web Audio API native counter chime synthesizer.
 * Generates clear, pleasant counter alert tones with zero external audio assets.
 */
let activeAudioContext = null;

// Auto-unlock AudioContext on first user interaction (touch/click) for mobile browsers
export function initAudioUnlocker() {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        if (!activeAudioContext) {
          activeAudioContext = new AudioContextClass();
        }
        if (activeAudioContext.state === 'suspended') {
          activeAudioContext.resume().catch(() => {});
        }
      }
    } catch (e) {}
    ['click', 'touchstart', 'touchend', 'pointerdown'].forEach(evt => {
      window.removeEventListener(evt, unlock);
    });
  };
  ['click', 'touchstart', 'touchend', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, unlock, { once: true, passive: true });
  });
}

// Auto-run unlocker when script runs on client
if (typeof window !== 'undefined') {
  initAudioUnlocker();
}

export function playChime(type = 'turn') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = activeAudioContext || new AudioContextClass();
    activeAudioContext = ctx;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'turn') {
      // 3-Tone High Priority Turn Arrival Chime (E5 -> G#5 -> B5)
      const tones = [
        { freq: 659.25, start: 0, duration: 0.45, gain: 0.3 },
        { freq: 830.61, start: 0.16, duration: 0.55, gain: 0.35 },
        { freq: 987.77, start: 0.34, duration: 0.9, gain: 0.4 }
      ];

      tones.forEach(({ freq, start, duration, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(0.001, now + start);
        gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    } else {
      // 2-Tone Gentle "Approaching Turn" Ping (A5 -> D6)
      const tones = [
        { freq: 880.00, start: 0, duration: 0.35, gain: 0.25 },
        { freq: 1174.66, start: 0.14, duration: 0.6, gain: 0.3 }
      ];

      tones.forEach(({ freq, start, duration, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(0.001, now + start);
        gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    }
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

/**
 * Loud, unmistakable Counter Arrival Ring for customer phone.
 * Plays a pleasant 2-cycle melodious desk ringer, triggers phone vibration,
 * and announces turn clearly via Speech Synthesis.
 */
export function playCounterRing({ tokenNumber = '', customerName = '', shopName = '' } = {}) {
  if (typeof window === 'undefined') return;

  // 1. Synthesize 2-burst melodious counter bell (G5 -> C6 -> E6 -> G6)
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const ctx = activeAudioContext || new AudioContextClass();
      activeAudioContext = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const notes = [
        // Burst 1: Rising pleasant airport / counter bell
        { freq: 783.99, start: 0.0, duration: 0.35, gain: 0.35 },
        { freq: 1046.50, start: 0.14, duration: 0.40, gain: 0.40 },
        { freq: 1318.51, start: 0.28, duration: 0.45, gain: 0.42 },
        { freq: 1567.98, start: 0.42, duration: 0.95, gain: 0.48 },

        // Burst 2: Second confirmation chime after 0.8s
        { freq: 783.99, start: 0.85, duration: 0.35, gain: 0.35 },
        { freq: 1046.50, start: 0.99, duration: 0.40, gain: 0.40 },
        { freq: 1318.51, start: 1.13, duration: 0.45, gain: 0.42 },
        { freq: 1567.98, start: 1.27, duration: 1.25, gain: 0.50 }
      ];

      notes.forEach(({ freq, start, duration, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Triangle wave gives a clear, warm acoustic bell tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(0.001, now + start);
        gainNode.gain.exponentialRampToValueAtTime(gain, now + start + 0.025);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    }
  } catch (err) {
    console.warn('Counter ring audio synthesizer error:', err);
  }

  // 2. Mobile Device Vibration (haptic buzz: long-short-long pattern)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([400, 200, 400, 200, 600]);
    } catch (e) {}
  }

  // 3. Clear Voice Announcement
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const tokenDisplay = tokenNumber ? `Token ${tokenNumber}` : 'Aapka token';
      const shopDisplay = shopName ? ` ${shopName} par` : '';
      const announcement = `${tokenDisplay}, aapka number aa gaya hai! Kripya service counter par aa jayein.`;
      
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
      
      // Delay speech slightly so initial bell chime is clearly heard first
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (err) {}
      }, 700);
    } catch (e) {}
  }
}

/**
 * Stops voice announcement and clears vibration
 */
export function stopCounterRing() {
  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  }
}

