/*
  Trillion sound design: everything is synthesized with the Web Audio API (no audio files).
  Sfx.play(name, arg) for effects; Sfx.setSfx(bool) / Sfx.setMusic(bool) for the toggles.
  Mix rules: rewards peak around -10 dBFS (rarest ~ equal to the top reward, never above it);
  UI sounds sit 6-10 dB under that; nothing has a hard attack, and bright waves are filtered.
*/
(() => {
  "use strict";

  const PREF_KEY = "trillion:audio";
  const prefs = { sfx: true, music: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); } catch (e) { /* ignore */ }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };

  // ---------- per-game voice ----------
  // shelf/hp: master EQ. toneLp: default lowpass for any non-sine oscillator. bell: [ratio, amp] partials.
  // sparkle: [lo, hi] Hz of the twinkles. jingle: "sleigh" | "coin" | "glass". trim: per-sound level in dB.
  const P = {
    shelfHz: 4500, shelfDb: -4, hp: 70, toneLp: 3200, musicLevel: 0.4, verb: 0.25,
    bell: [[1, 1], [2.4, 0.3], [3.9, 0.1], [5.2, 0.03]],
    sparkle: [1600, 3000], jingle: "coin",
    trim: {"click": 16.8, "open": 16.3, "close": 11.8, "key": 15.2, "start": 2.3, "tick": 15.7, "submit": 15.3, "miracle": 1.4, "t75": 1.9, "t50": 3.4, "t25": 9.4, "t10": 7.0, "trap": 9.0, "miss": 8.9, "timeout": 8.1, "count": 15.5, "fanfare": 1.3, "share": 10.7, "unlock": 1.2, "join": 5.3, "nope": 9.1, "land": 16.0, "rain": 6.7},
  };

  const N = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, C7: 2093.0,
  };

  let ctx = null, master, sfxBus, musicBus, verbIn, noiseBuf;
  const MUSIC_LEVEL = P.musicLevel;   // background music sits quietly under the effects

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      // master EQ (tame the top, cut rumble) -> compressor (glue + clip protection) -> out
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.ratio.value = 4;
      comp.connect(ctx.destination);
      const shelf = ctx.createBiquadFilter();
      shelf.type = "highshelf";
      shelf.frequency.value = P.shelfHz;
      shelf.gain.value = P.shelfDb;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = P.hp;
      hp.Q.value = 0.5;
      hp.connect(shelf);
      shelf.connect(comp);
      master = hp;
      sfxBus = ctx.createGain();
      sfxBus.gain.value = prefs.sfx ? 0.9 : 0;
      sfxBus.connect(master);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);
      // A small generated "room" reverb for bells and chimes.
      const conv = ctx.createConvolver();
      conv.buffer = impulse(1.6, 2.8);
      verbIn = ctx.createGain();
      verbIn.gain.value = P.verb;
      verbIn.connect(conv);
      conv.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec);
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = b.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  function envelope(g, t, vol, attack, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function send(node, bus, wet) {
    node.connect(bus);
    if (wet) {
      const w = ctx.createGain();
      w.gain.value = wet;
      node.connect(w);
      w.connect(verbIn);
    }
  }

  // ---------- building blocks ----------
  function tone(freq, opts) {
    const o = Object.assign({ at: 0, dur: 0.2, vol: 0.2, type: "sine", attack: 0.008, slide: null, lp: null, lpTo: null, vib: 0, bus: sfxBus, wet: 0 }, opts);
    const t = ctx.currentTime + o.at;
    const osc = ctx.createOscillator();
    osc.type = o.type;
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + o.dur);
    if (o.vib) {
      const lfo = ctx.createOscillator(), depth = ctx.createGain();
      lfo.frequency.value = 6;
      depth.gain.value = o.vib;
      lfo.connect(depth);
      depth.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + o.dur + 0.05);
    }
    const g = ctx.createGain();
    envelope(g, t, o.vol, o.attack, o.dur);
    let node = osc;
    const lpHz = o.lp || (o.type !== "sine" ? P.toneLp : 0);   // bright waves are always filtered
    if (lpHz) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(lpHz, t);
      if (o.lp && o.lpTo) f.frequency.exponentialRampToValueAtTime(o.lpTo, t + o.dur);
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    send(g, o.bus, o.wet);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  // Inharmonic partials give a bell / music-box chime (the partial set is part of each game's voice).
  function bell(freq, opts) {
    const o = Object.assign({ at: 0, dur: 1.2, vol: 0.15, bus: sfxBus, wet: 0.5 }, opts);
    P.bell.forEach(([r, a], k) =>
      tone(freq * r, { at: o.at, dur: o.dur / (1 + k * 0.7), vol: o.vol * a, attack: 0.004, bus: o.bus, wet: o.wet }));
  }

  function noise(opts) {
    const o = Object.assign({ at: 0, dur: 0.1, vol: 0.2, type: "bandpass", freq: 3000, q: 1, sweepTo: null, attack: 0.008, bus: sfxBus, wet: 0 }, opts);
    const t = ctx.currentTime + o.at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.type;
    f.frequency.setValueAtTime(o.freq, t);
    f.Q.value = o.q;
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + o.dur);
    const g = ctx.createGain();
    envelope(g, t, o.vol, o.attack, o.dur);
    src.connect(f);
    f.connect(g);
    send(g, o.bus, o.wet);
    src.start(t, Math.random() * 0.5);
    src.stop(t + o.dur + 0.05);
  }

  // Coin clinks: a cluster of soft two-partial metallic hits.
  function jingle(opts) {
    const o = Object.assign({ at: 0, vol: 0.12, hits: 6, bus: sfxBus }, opts);
    const lpf = ctx.createBiquadFilter();            // keep the cluster out of the harsh top octave
    lpf.type = "lowpass";
    lpf.frequency.value = 6500;
    lpf.connect(o.bus);
    for (let i = 0; i < o.hits; i++) {
      const at = o.at + i * 0.02 + Math.random() * 0.014;
      if (P.jingle === "sleigh") {
        noise({ at, dur: 0.08, vol: o.vol * 1.5, freq: 3600 + Math.random() * 1800, q: 3, attack: 0.006, bus: lpf });
        tone(2300 + Math.random() * 1000, { at, dur: 0.09, vol: o.vol * 0.5, bus: lpf });
      } else if (P.jingle === "coin") {
        const f = 1700 + Math.random() * 700;        // a coin clink: two close inharmonic partials
        tone(f, { at, dur: 0.1, vol: o.vol * 0.7, bus: lpf });
        tone(f * 1.505, { at, dur: 0.07, vol: o.vol * 0.4, bus: lpf });
        noise({ at, dur: 0.03, vol: o.vol * 0.25, freq: 3200, q: 2, attack: 0.006, bus: lpf });
      } else {
        const f = 2300 + Math.random() * 1100;       // glass: pure sine + one stretched partial, no noise
        tone(f, { at, dur: 0.12, vol: o.vol * 0.6, bus: lpf });
        tone(f * 2.76, { at, dur: 0.06, vol: o.vol * 0.15, bus: lpf });
      }
    }
    setTimeout(() => { try { lpf.disconnect(); } catch (e) { /* ignore */ } }, (o.at + o.hits * 0.04 + 0.6) * 1000);
  }

  function sparkle(at, count, vol) {
    for (let i = 0; i < count; i++) tone(P.sparkle[0] + Math.random() * (P.sparkle[1] - P.sparkle[0]), { at: at + i * 0.055, dur: 0.18, vol, wet: 0.7 });
  }

  // ---------- the sound palette ----------
  const S = {
    click() { tone(1100, { dur: 0.06, vol: 0.08, attack: 0.006 }); },
    open() { noise({ dur: 0.24, vol: 0.12, type: "lowpass", freq: 400, sweepTo: 2600, q: 0.7, attack: 0.04 }); },
    close() { noise({ dur: 0.2, vol: 0.1, type: "lowpass", freq: 2200, sweepTo: 400, q: 0.7, attack: 0.03 }); },
    key() { tone(1700 + Math.random() * 400, { dur: 0.03, vol: 0.05, attack: 0.006 }); },
    start() {
      jingle({ vol: 0.09, hits: 8 });
      bell(N.G5, { at: 0.02, vol: 0.08, dur: 0.9 });
      bell(N.C6, { at: 0.13, vol: 0.07, dur: 1.1 });
    },
    tick(n) {                                    // n = seconds left (5..1)
      const f = n <= 1 ? 1400 : 950 + (5 - n) * 60;
      tone(f, { dur: 0.06, vol: n <= 1 ? 0.12 : 0.08, attack: 0.006 });
      noise({ dur: 0.025, vol: 0.02, freq: 2200, q: 2, attack: 0.006 });
    },
    submit() { tone(520, { dur: 0.1, vol: 0.1, slide: 880, type: "triangle", attack: 0.01 }); },
    miracle() {
      [N.C6, N.E6, N.G6, N.C7].forEach((f, i) => bell(f, { at: i * 0.07, vol: 0.11, dur: 1.7 }));
      jingle({ vol: 0.09, hits: 10 });
      jingle({ at: 0.35, vol: 0.07, hits: 10 });
      sparkle(0.3, 9, 0.025);
    },
    t75() {
      [N.G5, N.C6, N.E6].forEach((f, i) => bell(f, { at: i * 0.08, vol: 0.11, dur: 1.2 }));
      jingle({ at: 0.12, vol: 0.05 });
    },
    t50() { [N.E5, N.G5].forEach((f, i) => bell(f, { at: i * 0.09, vol: 0.11, dur: 1.0 })); },
    t25() { bell(N.C5, { vol: 0.12, dur: 0.9 }); },
    t10() {
      tone(N.A4, { dur: 0.12, vol: 0.08, type: "triangle", attack: 0.012 });
      tone(N.G4, { at: 0.11, dur: 0.18, vol: 0.08, type: "triangle", attack: 0.012 });
    },
    trap() {                                     // comedy "wah-wah-wah-waaah"
      [N.G4, 369.99, N.F4, N.E4].forEach((f, i) => {
        const last = i === 3;
        tone(f, { at: i * 0.27, dur: last ? 0.75 : 0.25, vol: 0.09, type: "sawtooth", attack: 0.03, lp: 500, lpTo: last ? 300 : 1100, vib: last ? 6 : 0 });
      });
    },
    miss() {                                     // a dull thud: a bad trade
      tone(150, { dur: 0.28, vol: 0.22, slide: 55, attack: 0.012 });
      noise({ dur: 0.14, vol: 0.12, type: "lowpass", freq: 320, attack: 0.012 });
    },
    timeout() {
      tone(N.A3, { dur: 0.16, vol: 0.07, type: "triangle", attack: 0.015, lp: 1000 });
      tone(N.G3, { at: 0.2, dur: 0.32, vol: 0.07, type: "triangle", attack: 0.015, lp: 1000 });
    },
    count(p) { tone(700 + p * 700, { dur: 0.035, vol: 0.06, attack: 0.006 }); },
    fanfare(pct) {
      const notes = pct >= 0.5 ? [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6] : pct >= 0.25 ? [N.C5, N.E5, N.G5, N.C6] : [N.C5, N.E5, N.G5];
      notes.forEach((f, i) => bell(f, { at: i * 0.09, vol: 0.1, dur: 1.4 }));
      if (pct >= 0.25) jingle({ at: 0.2, vol: 0.07, hits: 10 });
      if (pct >= 0.5) { jingle({ at: 0.55, vol: 0.06, hits: 12 }); sparkle(0.5, 12, 0.025); }
    },
    share() {
      tone(900, { dur: 0.07, vol: 0.09, slide: 1400, type: "triangle", attack: 0.01 });
      bell(N.E6, { at: 0.05, vol: 0.05, dur: 0.6 });
    },
    unlock() {
      [N.C5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => bell(f, { at: i * 0.08, vol: 0.1, dur: 1.6 }));
      jingle({ at: 0.1, vol: 0.09, hits: 14 });
      sparkle(0.4, 12, 0.03);
    },
    join() { bell(N.E5, { vol: 0.06, dur: 0.5 }); bell(N.A5, { at: 0.07, vol: 0.06, dur: 0.6 }); },
    // Coin rain: a scatter of soft clinks while the coins fall.
    rain(dur) {
      const d = Math.max(1, dur || 2.3);
      for (let at = 0.05; at < d * 0.75; at += 0.07 + Math.random() * 0.09) {
        const f = 1700 + Math.random() * 1500;
        tone(f, { at, dur: 0.12, vol: 0.03, bus: sfxBus, wet: 0.3 });
        tone(f * 1.505, { at, dur: 0.08, vol: 0.015, bus: sfxBus });
      }
    },
    land() { const f = 1500 + Math.random() * 700; tone(f, { dur: 0.1, vol: 0.05, wet: 0.3, attack: 0.01 }); tone(f * 1.5, { at: 0.02, dur: 0.07, vol: 0.025 }); },
    nope() {                                     // "not on the list": a soft double thump
      tone(N.G3, { dur: 0.08, vol: 0.08, type: "triangle", attack: 0.012, lp: 800 });
      tone(N.E3, { at: 0.09, dur: 0.12, vol: 0.08, type: "triangle", attack: 0.012, lp: 800 });
    },
  };

  // ---------- background music: a calm, original music-box lullaby ----------
  // Soft pad chords, a gentle bass and sparse music-box twinkles; quiet on purpose so it sits behind the game.
  const BEAT = 60 / 76;
  const CHORDS = [
    ["C4", "E4", "G4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"],
    ["C4", "E4", "G4"], ["E3", "G3", "B3"], ["F3", "A3", "C4"], ["G3", "B3", "D4"],
  ];
  const ROOTS = ["C3", "A3", "F3", "G3", "C3", "E3", "F3", "G3"];
  const PATTERN = [0, 2, 1, 2, null, 2, 1, null];          // twinkles over each 8-beat chord
  const LOOP_BEATS = CHORDS.length * 8;
  let loopGain = null, loopTimer = null;

  function scheduleLoop(startAt) {
    const g = ctx.createGain();
    g.connect(musicBus);
    loopGain = g;
    const rel = startAt - ctx.currentTime;
    CHORDS.forEach((chord, i) => {
      const at = rel + i * 8 * BEAT;
      chord.forEach((n) => tone(N[n], { at, dur: 8 * BEAT + 1.5, vol: 0.022, type: "sine", attack: 1.4, lp: 1400, bus: g, wet: 0.5 }));
      tone(N[ROOTS[i]] / 2, { at, dur: 4 * BEAT, vol: 0.035, type: "triangle", attack: 0.05, bus: g });
      PATTERN.forEach((k, b) => {
        if (k == null) return;
        bell(N[chord[k]] * 2, { at: at + b * BEAT + (b % 2 ? BEAT * 0.5 : 0), vol: 0.038, dur: 1.6, bus: g, wet: 0.55 });
      });
      if (i % 4 === 3) jingle({ at: at + 6 * BEAT, vol: 0.012, hits: 5, bus: g });
    });
    const next = startAt + LOOP_BEATS * BEAT;
    loopTimer = setTimeout(() => { if (prefs.music && ctx) scheduleLoop(next); }, (next - ctx.currentTime - 1) * 1000);
  }

  function startMusic() {
    if (!ensure() || loopGain) return;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(MUSIC_LEVEL, ctx.currentTime, 0.4);
    scheduleLoop(ctx.currentTime + 0.1);
  }

  function stopMusic() {
    clearTimeout(loopTimer);
    loopTimer = null;
    if (!ctx || !loopGain) return;
    const g = loopGain;
    loopGain = null;
    musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => { try { g.disconnect(); } catch (e) { /* ignore */ } }, 600);
  }

  // Quiet the music while a prompt is on screen so players can focus.
  function duck(on) {
    if (!ctx || !loopGain) return;
    musicBus.gain.setTargetAtTime(on ? MUSIC_LEVEL * 0.35 : MUSIC_LEVEL, ctx.currentTime, 0.3);
  }

  window.Sfx = {
    play(name, arg) {
      if (!prefs.sfx || !S[name] || !ensure()) return;
      try {
        // per-sound trim: route this sound's dry and reverb sends through gains set from P.trim (dB)
        const k = Math.pow(10, (P.trim[name] || 0) / 20);
        const realBus = sfxBus, realVerb = verbIn;
        const dry = ctx.createGain(), wet = ctx.createGain();
        dry.gain.value = wet.gain.value = k;
        dry.connect(realBus);
        wet.connect(realVerb);
        sfxBus = dry;
        verbIn = wet;
        try { S[name](arg); } finally { sfxBus = realBus; verbIn = realVerb; }
      } catch (e) { /* never let audio break the game */ }
    },
    unlock() { if (ensure() && prefs.music) startMusic(); },
    isSfx: () => prefs.sfx,
    isMusic: () => prefs.music,
    setSfx(on) {
      prefs.sfx = !!on;
      savePrefs();
      if (ctx) sfxBus.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.05);
    },
    setMusic(on) {
      prefs.music = !!on;
      savePrefs();
      if (on) startMusic(); else stopMusic();
    },
    duck,
  };

  // Browsers only allow audio after the first tap or keypress.
  const firstGesture = () => window.Sfx.unlock();
  document.addEventListener("pointerdown", firstGesture, { once: true });
  document.addEventListener("keydown", firstGesture, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
})();
