/*
  Chrillion sound design: everything is synthesized with the Web Audio API (no audio files).
  Sfx.play(name, arg) for effects; Sfx.setSfx(bool) / Sfx.setMusic(bool) for the toggles.
*/
(() => {
  "use strict";

  const PREF_KEY = "chrillion:audio";
  const prefs = { sfx: true, music: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); } catch (e) { /* ignore */ }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };

  const N = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, C7: 2093.0,
  };

  let ctx = null, master, sfxBus, musicBus, verbIn, noiseBuf;
  const MUSIC_LEVEL = 0.55;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createDynamicsCompressor();          // glue everything and prevent clipping
      master.threshold.value = -12;
      master.ratio.value = 4;
      master.connect(ctx.destination);
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
      verbIn.gain.value = 0.3;
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

  // Inharmonic partials give a bell / music-box chime.
  function bell(freq, opts) {
    const o = Object.assign({ at: 0, dur: 1.2, vol: 0.15, bus: sfxBus, wet: 0.5 }, opts);
    [[1, 1], [2, 0.45], [3.01, 0.22], [4.2, 0.1], [5.43, 0.06]].forEach(([r, a], k) =>
      tone(freq * r, { at: o.at, dur: o.dur / (1 + k * 0.7), vol: o.vol * a, attack: 0.002, bus: o.bus, wet: o.wet }));
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

  // Sleigh bells: a cluster of tiny metallic hits.
  function jingle(opts) {
    const o = Object.assign({ at: 0, vol: 0.12, hits: 6, bus: sfxBus }, opts);
    for (let i = 0; i < o.hits; i++) {
      const at = o.at + i * 0.018 + Math.random() * 0.012;
      noise({ at, dur: 0.07, vol: o.vol * 1.6, freq: 7000 + Math.random() * 3000, q: 6, bus: o.bus });
      tone(5200 + Math.random() * 2400, { at, dur: 0.06, vol: o.vol * 0.2, bus: o.bus });
    }
  }

  function sparkle(at, count, vol) {
    for (let i = 0; i < count; i++) tone(2600 + Math.random() * 2600, { at: at + i * 0.055, dur: 0.16, vol, wet: 0.7 });
  }

  // ---------- the sound palette ----------
  const S = {
    click() { tone(1400, { dur: 0.045, vol: 0.05, type: "triangle" }); },
    open() { noise({ dur: 0.22, vol: 0.07, type: "lowpass", freq: 400, sweepTo: 3200, q: 0.8 }); },
    close() { noise({ dur: 0.18, vol: 0.05, type: "lowpass", freq: 2600, sweepTo: 400, q: 0.8 }); },
    key() { tone(2300 + Math.random() * 400, { dur: 0.018, vol: 0.018, type: "square", lp: 3500 }); },
    start() {
      jingle({ vol: 0.09, hits: 8 });
      bell(N.G5, { at: 0.02, vol: 0.08, dur: 0.9 });
      bell(N.C6, { at: 0.13, vol: 0.07, dur: 1.1 });
    },
    tick(n) {                                    // n = seconds left (5..1)
      const f = n <= 1 ? 1550 : 1050 + (5 - n) * 70;
      tone(f, { dur: 0.05, vol: n <= 1 ? 0.12 : 0.08 });
      noise({ dur: 0.02, vol: 0.05, freq: 2500, q: 2 });
    },
    submit() { tone(520, { dur: 0.09, vol: 0.1, slide: 880, type: "triangle" }); },
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
      tone(N.A4, { dur: 0.12, vol: 0.08, type: "triangle" });
      tone(N.G4, { at: 0.11, dur: 0.18, vol: 0.08, type: "triangle" });
    },
    trap() {                                     // comedy "wah-wah-wah-waaah"
      [N.G4, 369.99, N.F4, N.E4].forEach((f, i) => {
        const last = i === 3;
        tone(f, { at: i * 0.27, dur: last ? 0.75 : 0.25, vol: 0.09, type: "sawtooth", lp: 500, lpTo: last ? 300 : 1400, vib: last ? 6 : 0 });
      });
    },
    miss() {                                     // a lump of coal hitting the hearth
      tone(150, { dur: 0.28, vol: 0.22, slide: 55 });
      noise({ dur: 0.14, vol: 0.12, type: "lowpass", freq: 320 });
    },
    timeout() {
      tone(N.A3, { dur: 0.16, vol: 0.07, type: "square", lp: 1200 });
      tone(N.G3, { at: 0.2, dur: 0.32, vol: 0.07, type: "square", lp: 1200 });
    },
    count(p) { tone(700 + p * 900, { dur: 0.03, vol: 0.04, type: "triangle" }); },
    fanfare(pct) {
      const notes = pct >= 0.5 ? [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6] : pct >= 0.25 ? [N.C5, N.E5, N.G5, N.C6] : [N.C5, N.E5, N.G5];
      notes.forEach((f, i) => bell(f, { at: i * 0.09, vol: 0.1, dur: 1.4 }));
      if (pct >= 0.25) jingle({ at: 0.2, vol: 0.07, hits: 10 });
      if (pct >= 0.5) { jingle({ at: 0.55, vol: 0.06, hits: 12 }); sparkle(0.5, 12, 0.025); }
    },
    share() {
      tone(900, { dur: 0.06, vol: 0.09, slide: 1400, type: "triangle" });
      bell(N.E6, { at: 0.05, vol: 0.05, dur: 0.6 });
    },
    unlock() {
      [N.C5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => bell(f, { at: i * 0.08, vol: 0.1, dur: 1.6 }));
      jingle({ at: 0.1, vol: 0.09, hits: 14 });
      sparkle(0.4, 12, 0.03);
    },
    join() { bell(N.E5, { vol: 0.06, dur: 0.5 }); bell(N.A5, { at: 0.07, vol: 0.06, dur: 0.6 }); },
    // Sleigh bells that pan across the stereo field as Santa flies right to left.
    sleigh(dur) {
      const d = Math.max(1, dur || 2.3);
      const t = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(1, t + d * 0.25);
      out.gain.setValueAtTime(1, t + d * 0.7);
      out.gain.exponentialRampToValueAtTime(0.0001, t + d);
      let node = out;
      if (ctx.createStereoPanner) {
        const pan = ctx.createStereoPanner();
        pan.pan.setValueAtTime(0.85, t);
        pan.pan.linearRampToValueAtTime(-0.85, t + d);
        out.connect(pan);
        node = pan;
      }
      node.connect(sfxBus);
      for (let at = 0; at < d; at += 0.11) jingle({ at, vol: 0.05, hits: 4, bus: out });
      setTimeout(() => { try { node.disconnect(); out.disconnect(); } catch (e) { /* ignore */ } }, (d + 0.5) * 1000);
    },
    nope() {                                     // "not on the list": a soft double buzz
      tone(N.G3, { dur: 0.08, vol: 0.08, type: "square", lp: 900 });
      tone(N.E3, { at: 0.09, dur: 0.12, vol: 0.08, type: "square", lp: 900 });
    },
    land() { tone(180 + Math.random() * 60, { dur: 0.07, vol: 0.06, type: "triangle", slide: 120 }); },
  };

  // ---------- background music: a music-box "Jingle Bells" (public domain, 1857) ----------
  const MELODY = [
    ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["G5", 1], ["C5", 1.5], ["D5", 0.5], ["E5", 4],
    ["F5", 1], ["F5", 1], ["F5", 1.5], ["F5", 0.5], ["F5", 1], ["E5", 1], ["E5", 1], ["E5", 0.5], ["E5", 0.5],
    ["E5", 1], ["D5", 1], ["D5", 1], ["E5", 1], ["D5", 2], ["G5", 2],
    ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["G5", 1], ["C5", 1.5], ["D5", 0.5], ["E5", 4],
    ["F5", 1], ["F5", 1], ["F5", 1], ["F5", 1], ["F5", 1], ["E5", 1], ["E5", 1], ["E5", 0.5], ["E5", 0.5],
    ["G5", 1], ["G5", 1], ["F5", 1], ["D5", 1], ["C5", 4],
  ];
  const BASS = ["C3", "C3", "C3", "C3", "F3", "C3", "D3", "G3", "C3", "C3", "C3", "C3", "F3", "C3", "G3", "C3"];
  const BEAT = 60 / 112;
  const LOOP_BEATS = 64;
  let loopGain = null, loopTimer = null;

  function scheduleLoop(startAt) {
    const g = ctx.createGain();
    g.connect(musicBus);
    loopGain = g;
    const rel = startAt - ctx.currentTime;
    let beat = 0;
    MELODY.forEach(([n, d]) => {
      bell(N[n], { at: rel + beat * BEAT, vol: 0.09, dur: Math.max(0.6, d * BEAT * 1.4), bus: g, wet: 0.35 });
      beat += d;
    });
    BASS.forEach((n, bar) => {
      [0, 2].forEach((b) => tone(N[n], { at: rel + (bar * 4 + b) * BEAT, dur: BEAT * 1.8, vol: 0.05, type: "triangle", bus: g }));
      [1, 3].forEach((b) => jingle({ at: rel + (bar * 4 + b) * BEAT, vol: 0.018, hits: 3, bus: g }));
    });
    const next = startAt + LOOP_BEATS * BEAT + BEAT * 2;   // a short breath between loops
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
