"use client";

/**
 * Web Audio API native counter chime synthesizer.
 * Generates clear, pleasant counter alert tones with zero external audio assets.
 */
export function playChime(type = 'turn') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'turn') {
      // 3-Tone High Priority Turn Arrival Chime (E5 -> G#5 -> B5)
      const tones = [
        { freq: 659.25, start: 0, duration: 0.45, gain: 0.25 },
        { freq: 830.61, start: 0.16, duration: 0.55, gain: 0.3 },
        { freq: 987.77, start: 0.34, duration: 0.9, gain: 0.35 }
      ];

      tones.forEach(({ freq, start, duration, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(gain, now + start);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    } else {
      // 2-Tone Gentle "Approaching Turn" Ping (A5 -> D6)
      const tones = [
        { freq: 880.00, start: 0, duration: 0.35, gain: 0.2 },
        { freq: 1174.66, start: 0.14, duration: 0.6, gain: 0.25 }
      ];

      tones.forEach(({ freq, start, duration, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(gain, now + start);
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
