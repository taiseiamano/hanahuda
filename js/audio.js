// Web Audio API Sound Synthesizer for Hanafuda Game
// Provides satisfying, modern-retro game sounds dynamically without any external assets.

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundEffects = {
  // Soft wooden click for selecting a card
  playSelect() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio error: ", e);
    }
  },

  // Satisfying cardboard/wooden "thud/snap" when placing a Hanafuda card
  playPlace() {
    try {
      const ctx = getAudioContext();
      
      // We will make a complex slap sound by combining two nodes
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(150, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(350, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio error: ", e);
    }
  },

  // Sparkling chime sound for a matching pair
  playMatch() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      
      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + index * 0.04);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.04 + 0.15);
        
        osc.start(now + index * 0.04);
        osc.stop(now + index * 0.04 + 0.16);
      });
    } catch (e) {
      console.warn("Audio error: ", e);
    }
  },

  // Celebratory traditional fanfare (Shamisen / Koto vibe) for Yaku completed!
  playYaku() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Traditional Japanese scale notes: Yo scale or similar pentatonic (e.g., D, G, A, C, D)
      const melody = [587.33, 698.46, 783.99, 880.00, 1046.50, 1174.66]; // D5, F5, G5, A5, C6, D6
      const rhythm = [0.0, 0.08, 0.16, 0.24, 0.35, 0.5];
      
      melody.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Use saw/triangle combination for a slightly plucked string feel
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + rhythm[idx]);
        
        // Add a pitch bend (pluck effect)
        osc.frequency.exponentialRampToValueAtTime(f * 0.98, now + rhythm[idx] + 0.25);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + rhythm[idx] + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + rhythm[idx] + 0.3);
        
        osc.start(now + rhythm[idx]);
        osc.stop(now + rhythm[idx] + 0.32);
      });
    } catch (e) {
      console.warn("Audio error: ", e);
    }
  },

  // Shuffle deck effect (repeated rustles)
  playShuffle() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      for (let i = 0; i < 6; i++) {
        const time = now + i * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200 + Math.random() * 200, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        
        osc.start(time);
        osc.stop(time + 0.05);
      }
    } catch (e) {
      console.warn("Audio error: ", e);
    }
  },

  // Game/Round Over sweep
  playGameOver(isWinner = true) {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      if (isWinner) {
        // Ascending major chord sweep
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.linearRampToValueAtTime(523.25, now + 0.4); // C5
        osc.frequency.linearRampToValueAtTime(1046.50, now + 0.8); // C6
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        osc.start(now);
        osc.stop(now + 1.0);
      } else {
        // Descending sad scale
        osc.frequency.setValueAtTime(392.00, now); // G4
        osc.frequency.linearRampToValueAtTime(293.66, now + 0.4); // D4
        osc.frequency.linearRampToValueAtTime(196.00, now + 0.8); // G3
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        osc.start(now);
        osc.stop(now + 1.0);
      }
    } catch (e) {
      console.warn("Audio error: ", e);
    }
  }
};
