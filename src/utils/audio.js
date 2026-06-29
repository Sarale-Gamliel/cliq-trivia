let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays DTMF dual tone for a phone keypad key
 */
export function playDTMF(digit, duration = 0.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const dtmfFrequencies = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477],
    };

    const freqs = dtmfFrequencies[digit.toString()];
    if (!freqs) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    // Smooth envelope to avoid clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime + duration - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("AudioContext block:", e);
  }
}

/**
 * Simulates the sound of dialing and the line ringing once or twice
 */
export function playDialAndRing(onConnect) {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      if (onConnect) onConnect();
      return;
    }

    // Play a sequence: 3 quick DTMF keypress sounds (dialing)
    setTimeout(() => playDTMF('0', 0.1), 0);
    setTimeout(() => playDTMF('7', 0.1), 150);
    setTimeout(() => playDTMF('7', 0.1), 300);

    // After dialing, start a simulated ringing tone (440Hz + 480Hz) for 1.2 seconds
    setTimeout(() => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime + 1.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);

      // When the ring finishes, play the call connection beep
      setTimeout(() => {
        playCallConnectedSound();
        if (onConnect) onConnect();
      }, 1250);

    }, 600);

  } catch (e) {
    if (onConnect) onConnect();
  }
}

/**
 * Plays the short beep indicating the phone call has connected
 */
export function playCallConnectedSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.frequency.value = 1000; // High pitch short beep
    osc.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime + 0.12);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

/**
 * Plays a quick tick sound for timer countdown
 */
export function playTickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.frequency.value = 600;
    osc.type = 'sine';

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {}
}

/**
 * Plays a chime for a correct answer
 */
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Play two notes in a rising chord
    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.03);
      gainNode.gain.setValueAtTime(0.1, startTime + duration - 0.03);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.12, 0.25); // E5
  } catch (e) {}
}

/**
 * Plays a buzzer for an incorrect answer
 */
export function playIncorrectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 110; // Low frequency buzz

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime + 0.35);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

    // Simple low pass filter to make it less harsh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

/**
 * Plays a building suspense sound before revealing the answer (~3.5s)
 */
export function playSuspenseSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low bass "thump" that speeds up
    const thump = (time, vol = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.25);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(time); osc.stop(time + 0.3);
    };

    // Heartbeat getting faster
    [0, 0.55, 1.05, 1.45, 1.75, 1.98, 2.17, 2.32, 2.45, 2.56].forEach((t, i) =>
      thump(now + t, 0.18 + i * 0.012)
    );

    // Rising tension drone
    const drone = (freq, start, end, vol) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.linearRampToValueAtTime(freq * 1.4, end);
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(300, start);
      filt.frequency.linearRampToValueAtTime(1200, end);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.15);
      gain.gain.linearRampToValueAtTime(vol * 1.3, end - 0.1);
      gain.gain.linearRampToValueAtTime(0, end);
      osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      osc.start(start); osc.stop(end + 0.05);
    };
    drone(82.5, now + 0.4, now + 2.65, 0.05);
    drone(110, now + 0.9, now + 2.65, 0.03);

    // Final reveal chord CRASH
    const revealTime = now + 2.7;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, revealTime);
      gain.gain.linearRampToValueAtTime(0.12 - i * 0.02, revealTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, revealTime + 1.0);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(revealTime); osc.stop(revealTime + 1.05);
    });
  } catch (e) {}
}

/**
 * Plays a short congratulatory melody at the end of the game
 */
export function playGameOverSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const durations = [0.15, 0.15, 0.15, 0.5];

    let currentStart = now;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, currentStart);
      gainNode.gain.linearRampToValueAtTime(0.1, currentStart + 0.02);
      gainNode.gain.setValueAtTime(0.1, currentStart + durations[idx] - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, currentStart + durations[idx]);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(currentStart);
      osc.stop(currentStart + durations[idx]);

      currentStart += durations[idx] - 0.02;
    });
  } catch (e) {}
}

/**
 * Plays a rising glissando fanfare for joker questions (~1.5s)
 * Ascending notes C4→C6 using triangle wave
 */
export function playJokerSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 8 ascending notes C4 to C6
    const notes = [261.63, 311.13, 369.99, 440.00, 523.25, 622.25, 739.99, 1046.50];
    const stepDuration = 0.18;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = now + i * stepDuration;
      const dur = stepDuration + 0.05;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.setValueAtTime(0.12, startTime + dur - 0.04);
      gain.gain.linearRampToValueAtTime(0, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });

    // Final big chord at the end
    const chordTime = now + notes.length * stepDuration + 0.05;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, chordTime);
      gain.gain.linearRampToValueAtTime(0.1 - i * 0.015, chordTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(chordTime);
      osc.stop(chordTime + 0.65);
    });
  } catch (e) {}
}

/**
 * Plays an electric zap sound for lightning round (~0.5s)
 * White noise burst + high frequency sweep down
 */
export function playLightningSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // White noise burst
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(4000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 0.4);
    noiseFilter.Q.value = 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + 0.5);

    // High freq sweep oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3000, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
    oscGain.gain.setValueAtTime(0.08, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {}
}

/**
 * Plays a flatline / phone disconnect sound for eliminated players (~1s)
 * Single descending tone, then flatline buzz
 */
export function playEliminatedSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Descending tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.linearRampToValueAtTime(200, now + 0.35);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.linearRampToValueAtTime(0, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.42);

    // Flatline buzz (continuous low tone)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 440;
    gain2.gain.setValueAtTime(0, now + 0.45);
    gain2.gain.linearRampToValueAtTime(0.09, now + 0.5);
    gain2.gain.setValueAtTime(0.09, now + 0.9);
    gain2.gain.linearRampToValueAtTime(0, now + 1.0);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.45);
    osc2.stop(now + 1.05);
  } catch (e) {}
}
