/*
  Mogillion sound design: everything is synthesized with the Web Audio API (no audio files).
  Phonk palette: cowbell, 808 kick/bass, clap, hats, chrome sparkles, and a short dark looping beat.
  Sfx.play(name, arg) for effects; Sfx.setSfx(bool) / Sfx.setMusic(bool) for the toggles.
*/
(() => {
  "use strict";

  const PREF_KEY = "mogillion:audio";
  const prefs = { sfx: true, music: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); } catch (e) { /* ignore */ }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };

  // F minor, the phonk home key.
  const N = {
    C2: 65.41, Db2: 69.3, F2: 87.31, F3: 174.61,
    G4: 392.0, Ab4: 415.3, C5: 523.25, Db5: 554.37, Eb5: 622.25, F4: 349.23, F5: 698.46, Ab5: 830.61, C6: 1046.5,
  };

  let ctx = null, master, sfxBus, musicBus, verbIn, noiseBuf;
  const MUSIC_LEVEL = 0.6;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createDynamicsCompressor();          // glue everything and prevent clipping
      master.threshold.value = -12;
      master.ratio.value = 5;
      master.connect(ctx.destination);
      sfxBus = ctx.createGain();
      sfxBus.gain.value = prefs.sfx ? 0.9 : 0;
      sfxBus.connect(master);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);
      const conv = ctx.createConvolver();               // small dark room for sparkles and cowbells
      conv.buffer = impulse(1.2, 3.2);
      verbIn = ctx.createGain();
      verbIn.gain.value = 0.25;
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
    const o = Object.assign({ at: 0, dur: 0.2, vol: 0.2, type: "sine", attack: 0.005, slide: null, lp: null, lpTo: null, vib: 0, bus: sfxBus, wet: 0 }, opts);
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
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(o.lp, t);
      if (o.lpTo) f.frequency.exponentialRampToValueAtTime(o.lpTo, t + o.dur);
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    send(g, o.bus, o.wet);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  function noise(opts) {
    const o = Object.assign({ at: 0, dur: 0.1, vol: 0.2, type: "bandpass", freq: 3000, q: 1, sweepTo: null, bus: sfxBus, wet: 0 }, opts);
    const t = ctx.currentTime + o.at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.type;
    f.frequency.setValueAtTime(o.freq, t);
    f.Q.value = o.q;
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + o.dur);
    const g = ctx.createGain();
    envelope(g, t, o.vol, 0.003, o.dur);
    src.connect(f);
    f.connect(g);
    send(g, o.bus, o.wet);
    src.start(t, Math.random() * 0.5);
    src.stop(t + o.dur + 0.05);
  }

  // The 808 cowbell: two detuned squares through a bandpass, short and hollow.
  function cowbell(freq, opts) {
    const o = Object.assign({ at: 0, vol: 0.1, dur: 0.26, bus: sfxBus, wet: 0.15 }, opts);
    const t = ctx.currentTime + o.at;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq * 2.1;
    bp.Q.value = 1.1;
    const g = ctx.createGain();
    envelope(g, t, o.vol, 0.002, o.dur);
    bp.connect(g);
    [1, 1.505].forEach((r) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq * r;
      osc.connect(bp);
      osc.start(t);
      osc.stop(t + o.dur + 0.05);
    });
    send(g, o.bus, o.wet);
  }

  function kick(opts) {
    const o = Object.assign({ at: 0, vol: 0.5, bus: sfxBus }, opts);
    tone(170, { at: o.at, dur: 0.42, vol: o.vol, slide: 40, attack: 0.002, bus: o.bus });
    noise({ at: o.at, dur: 0.03, vol: o.vol * 0.25, type: "lowpass", freq: 1800, bus: o.bus });
  }

  function bass(freq, opts) {                         // 808 bass note with a little pitch drop
    const o = Object.assign({ at: 0, dur: 0.5, vol: 0.34, bus: sfxBus }, opts);
    tone(freq * 1.6, { at: o.at, dur: o.dur, vol: o.vol, slide: freq, attack: 0.004, bus: o.bus });
    tone(freq * 2, { at: o.at, dur: o.dur * 0.8, vol: o.vol * 0.25, type: "triangle", lp: 600, bus: o.bus });
  }

  function clap(opts) {
    const o = Object.assign({ at: 0, vol: 0.16, bus: sfxBus }, opts);
    [0, 0.012, 0.024].forEach((d) => noise({ at: o.at + d, dur: 0.05, vol: o.vol, freq: 1700, q: 1.4, bus: o.bus }));
    noise({ at: o.at + 0.03, dur: 0.16, vol: o.vol * 0.7, freq: 1500, q: 0.9, bus: o.bus, wet: 0.2 });
  }

  function hat(opts) {
    const o = Object.assign({ at: 0, vol: 0.05, dur: 0.035, bus: sfxBus }, opts);
    noise({ at: o.at, dur: o.dur, vol: o.vol, type: "highpass", freq: 8000, q: 0.7, bus: o.bus });
  }

  // Bright chrome ping, used for sparkle runs.
  function sparkle(at, count, vol) {
    for (let i = 0; i < count; i++) tone(2600 + Math.random() * 2800, { at: at + i * 0.05, dur: 0.14, vol, wet: 0.7 });
  }

  // ---------- the sound palette ----------
  const S = {
    click() { tone(1400, { dur: 0.045, vol: 0.05, type: "triangle" }); },
    open() { noise({ dur: 0.22, vol: 0.07, type: "lowpass", freq: 400, sweepTo: 3200, q: 0.8 }); },
    close() { noise({ dur: 0.18, vol: 0.05, type: "lowpass", freq: 2600, sweepTo: 400, q: 0.8 }); },
    key() { tone(2300 + Math.random() * 400, { dur: 0.018, vol: 0.018, type: "square", lp: 3500 }); },
    start() {
      kick({ vol: 0.4 });
      cowbell(N.F4, { at: 0.02, vol: 0.09 });
      cowbell(N.Ab4, { at: 0.17, vol: 0.09 });
      cowbell(N.C5, { at: 0.3, vol: 0.1 });
      hat({ at: 0.17 });
    },
    tick(n) {                                    // n = seconds left (5..1)
      const f = n <= 1 ? 1550 : 1050 + (5 - n) * 70;
      tone(f, { dur: 0.05, vol: n <= 1 ? 0.12 : 0.08 });
      noise({ dur: 0.02, vol: 0.05, freq: 2500, q: 2 });
    },
    submit() { tone(520, { dur: 0.09, vol: 0.1, slide: 880, type: "triangle" }); },
    miracle() {                                  // the full edit drop
      kick({ vol: 0.55 });
      noise({ dur: 0.35, vol: 0.12, type: "highpass", freq: 600, sweepTo: 9000, q: 0.8 });
      [N.Ab4, N.C5, N.Eb5, N.Ab5].forEach((f, i) => cowbell(f, { at: 0.12 + i * 0.085, vol: 0.12 }));
      kick({ at: 0.46, vol: 0.55 });
      bass(N.F2, { at: 0.46, dur: 1.3, vol: 0.4 });
      clap({ at: 0.46 });
      sparkle(0.5, 10, 0.025);
    },
    t75() {
      kick({ vol: 0.45 });
      [N.C5, N.Eb5, N.Ab5].forEach((f, i) => cowbell(f, { at: 0.1 + i * 0.09, vol: 0.11 }));
      clap({ at: 0.36, vol: 0.12 });
      sparkle(0.2, 4, 0.025);
    },
    t50() {
      kick({ vol: 0.35 });
      cowbell(N.Ab4, { at: 0.1, vol: 0.1 });
      cowbell(N.C5, { at: 0.22, vol: 0.1 });
    },
    t25() { kick({ vol: 0.3 }); cowbell(N.C5, { at: 0.08, vol: 0.09 }); },
    t10() {
      tone(N.G4 / 2, { dur: 0.14, vol: 0.09, type: "triangle" });
      tone(N.F4 / 2, { at: 0.12, dur: 0.2, vol: 0.09, type: "triangle" });
    },
    trap() {                                     // comedy "wah-wah-wah-waaah"
      [N.G4, 369.99, N.F4, 329.63].forEach((f, i) => {
        const last = i === 3;
        tone(f, { at: i * 0.27, dur: last ? 0.75 : 0.25, vol: 0.09, type: "sawtooth", lp: 500, lpTo: last ? 300 : 1400, vib: last ? 6 : 0 });
      });
    },
    miss() {                                     // a dead 808 thud
      bass(N.F2, { dur: 0.4, vol: 0.4 });
      noise({ dur: 0.1, vol: 0.08, type: "lowpass", freq: 320 });
    },
    timeout() {
      tone(220, { dur: 0.16, vol: 0.07, type: "square", lp: 1200 });
      tone(196, { at: 0.2, dur: 0.32, vol: 0.07, type: "square", lp: 1200 });
      kick({ at: 0.5, vol: 0.3 });
    },
    count(p) { tone(700 + p * 900, { dur: 0.03, vol: 0.04, type: "triangle" }); },
    fanfare(pct) {                               // end-of-run sting scales with the score
      kick({ vol: 0.45 });
      cowbell(N.Ab4, { at: 0.1, vol: 0.1 });
      cowbell(N.C5, { at: 0.2, vol: 0.1 });
      if (pct >= 0.25) { kick({ at: 0.3, vol: 0.45 }); cowbell(N.Eb5, { at: 0.3, vol: 0.11 }); clap({ at: 0.3 }); }
      if (pct >= 0.5) {
        [N.Ab5, N.C6].forEach((f, i) => cowbell(f, { at: 0.42 + i * 0.09, vol: 0.1 }));
        bass(N.F2, { at: 0.6, dur: 1.2, vol: 0.4 });
        sparkle(0.6, 12, 0.025);
      }
    },
    share() {
      tone(900, { dur: 0.06, vol: 0.09, slide: 1400, type: "triangle" });
      cowbell(N.C5, { at: 0.05, vol: 0.07 });
    },
    unlock() {
      kick({ vol: 0.5 });
      [N.F4, N.Ab4, N.C5, N.Eb5, N.Ab5].forEach((f, i) => cowbell(f, { at: 0.08 + i * 0.075, vol: 0.1 }));
      bass(N.F2, { at: 0.5, dur: 1.2, vol: 0.38 });
      sparkle(0.5, 12, 0.03);
    },
    join() { cowbell(N.Ab4, { vol: 0.06, dur: 0.2 }); cowbell(N.C5, { at: 0.07, vol: 0.06, dur: 0.2 }); },
    // Riser into the hit: filtered noise sweeping up while panning across.
    whoosh(dur) {
      const d = Math.max(0.4, Math.min(1.2, dur || 0.7));
      noise({ dur: d, vol: 0.1, type: "bandpass", freq: 300, sweepTo: 7000, q: 1.2 });
    },
    nope() {                                     // "not on the list": a soft double buzz
      tone(196, { dur: 0.08, vol: 0.08, type: "square", lp: 900 });
      tone(164.81, { at: 0.09, dur: 0.12, vol: 0.08, type: "square", lp: 900 });
    },
    land() { tone(2000 + Math.random() * 1500, { dur: 0.06, vol: 0.03, wet: 0.5 }); },
  };
  S.sleigh = S.whoosh;                            // old name, kept so nothing breaks

  // ---------- background music: a short dark phonk loop in F minor, 132 BPM ----------
  const BPM = 132;
  const STEP = 60 / BPM / 4;
  const LOOP_STEPS = 64;                          // four bars of sixteenths
  const KICKS = [0, 6, 10];
  const BASS_ROOTS = [N.F2, N.F2, N.Db2, N.C2];
  // Cowbell melody: [step in bar, note] for bars 1 and 2 (repeated for bars 3 and 4).
  const BELL_A = [[0, N.F4], [3, N.F4], [6, N.Ab4], [10, N.C5], [12, N.Ab4]];
  const BELL_B = [[0, N.F4], [3, N.F4], [6, N.Ab4], [10, N.G4], [12, N.F4], [14, N.Db5]];
  let loopGain = null, loopTimer = null;

  function scheduleLoop(startAt) {
    const g = ctx.createGain();
    g.connect(musicBus);
    loopGain = g;
    const rel = startAt - ctx.currentTime;
    for (let bar = 0; bar < 4; bar++) {
      const b0 = rel + bar * 16 * STEP;
      KICKS.forEach((s) => kick({ at: b0 + s * STEP, vol: 0.34, bus: g }));
      if (bar === 3) kick({ at: b0 + 14 * STEP, vol: 0.3, bus: g });
      [4, 12].forEach((s) => clap({ at: b0 + s * STEP, vol: 0.07, bus: g }));
      for (let s = 0; s < 16; s += 2) hat({ at: b0 + s * STEP, vol: s % 4 === 0 ? 0.03 : 0.02, bus: g });
      if (bar % 2 === 1) [14, 15].forEach((s) => hat({ at: b0 + (s - 0.5) * STEP, vol: 0.022, bus: g }));
      bass(BASS_ROOTS[bar], { at: b0, dur: STEP * 5.5, vol: 0.28, bus: g });
      bass(BASS_ROOTS[bar], { at: b0 + 6 * STEP, dur: STEP * 3.5, vol: 0.22, bus: g });
      tone(N.F3, { at: b0, dur: STEP * 16, vol: 0.022, type: "sawtooth", lp: 420, bus: g });   // dark drone
      (bar % 2 === 0 ? BELL_A : BELL_B).forEach(([s, f]) => cowbell(f, { at: b0 + s * STEP, vol: 0.06, dur: 0.22, bus: g, wet: 0.2 }));
    }
    const next = startAt + LOOP_STEPS * STEP;
    loopTimer = setTimeout(() => { if (prefs.music && ctx) scheduleLoop(next); }, Math.max(0, (next - ctx.currentTime - 1) * 1000));
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
      try { S[name](arg); } catch (e) { /* never let audio break the game */ }
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
