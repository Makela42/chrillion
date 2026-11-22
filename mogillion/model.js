/*
  Mogillion model guy: an original illustrated male model (3/4 portrait, vector SVG).
  ModelGuy.svg(size, expression, opts)  -> SVG string. expression: neutral | smirk | impressed | shocked | disappointed
  ModelGuy.set(root, expression)        -> swap expression on any rendered guy inside root (CSS cross-fades it)
  ModelGuy.flash(el)                    -> camera-flash burst over an element
  ModelGuy.hero(el)                     -> photoshoot set with idle animation
*/
(() => {
  "use strict";
  const EXPR = ["neutral", "smirk", "impressed", "shocked", "disappointed"];
  let uid = 0;

  function svg(size, expression, opts) {
    opts = opts || {};
    const e = EXPR.includes(expression) ? expression : "neutral";
    const u = "mg" + (++uid);
    const w = size || 120, h = Math.round(w * 1.2);
    const idle = opts.idle === false ? "" : " mg-idle";
    return `<svg class="mg${idle}" data-expr="${e}" width="${w}" height="${h}" viewBox="0 0 200 240" role="img" aria-label="Coach Chad, an illustrated model" style="--mg-delay:${-(uid * 1.7 % 5).toFixed(1)}s">
<defs>
<linearGradient id="${u}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98765"/><stop offset=".45" stop-color="#e2b995"/><stop offset="1" stop-color="#efcaa9"/></linearGradient>
<linearGradient id="${u}n" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f6446"/><stop offset="1" stop-color="#b9885f"/></linearGradient>
<linearGradient id="${u}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2220"/><stop offset=".6" stop-color="#3a2c27"/><stop offset="1" stop-color="#1d1614"/></linearGradient>
<linearGradient id="${u}j" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a2029"/><stop offset=".6" stop-color="#10141b"/><stop offset="1" stop-color="#0a0d12"/></linearGradient>
<linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4de2f7" stop-opacity="0"/><stop offset=".6" stop-color="#4de2f7" stop-opacity=".0"/><stop offset="1" stop-color="#bdf6ff" stop-opacity=".95"/></linearGradient>
<linearGradient id="${u}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#e6fbff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="${u}i" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#bfe9f2"/><stop offset=".55" stop-color="#6fa9bd"/><stop offset="1" stop-color="#2b4d5e"/></radialGradient>
<clipPath id="${u}c"><path d="M58 100 C56 78 70 54 100 52 C130 52 146 76 144 100 C144 120 142 140 134 158 L112 186 Q100 193 90 187 L68 160 C60 142 58 120 58 100 Z M52 110 C42 60 70 30 104 30 C142 30 160 64 148 108 Z M10 240 L40 214 L72 200 L128 200 L162 214 L192 240 Z"/></clipPath>
<clipPath id="${u}el"><path d="M64 107.5 Q72 105.5 80 106 Q90 106.5 96 111 Q90 114 80 113.6 Q69 113 64 107.5 Z"/></clipPath><clipPath id="${u}er"><path d="M106 111 Q113 106.5 122 106 Q131 106 138 107 Q132 113.6 121 113.6 Q111 113.6 106 111 Z"/></clipPath>
<clipPath id="${u}f"><path d="M58 100 C56 78 70 54 100 52 C130 52 146 76 144 100 C144 120 142 140 134 158 L112 186 Q100 193 90 187 L68 160 C60 142 58 120 58 100 Z"/></clipPath>
</defs>
<g class="mg-all">
<g class="mg-body">
 <path d="M6 240 L22 216 Q40 204 74 198 L126 198 Q160 204 178 216 L194 240 Z" fill="url(#${u}j)"/>
 <path d="M74 198 L100 232 L126 198 Q112 206 100 206 Q88 206 74 198 Z" fill="#05070a"/>
 <path d="M76 197 L100 226 L124 197" fill="none" stroke="#2a323d" stroke-width="2.5" stroke-linejoin="round"/>
 <path d="M20 218 Q42 205 74 198 M178 216 Q168 210 150 205" fill="none" stroke="#2a323d" stroke-width="1.6"/>
 <path d="M178 216 L194 240" stroke="url(#${u}r)" stroke-width="3" fill="none"/>
 <path d="M126 198 Q160 204 178 216" stroke="#9fefff" stroke-width="2" fill="none" opacity=".75"/>
 <path d="M82 160 L82 202 Q100 214 118 202 L118 160 Z" fill="url(#${u}n)"/>
 <path d="M82 170 Q100 190 118 176 L118 160 L82 160 Z" fill="#6d4a35" opacity=".55"/>
 <path d="M118 162 L118 202" stroke="#bdf6ff" stroke-width="2" opacity=".55"/>
</g>
<g class="mg-head">
 <path d="M57 112 C48 108 48 128 60 130 Z" fill="#c99877"/>
 <path d="M143 112 C152 108 152 128 140 130 Z" fill="#e4bb98"/>
 <path d="M58 100 C56 78 70 54 100 52 C130 52 146 76 144 100 C144 120 142 140 134 158 L112 186 Q100 193 90 187 L68 160 C60 142 58 120 58 100 Z" fill="url(#${u}s)"/>
 <g clip-path="url(#${u}f)">
  <path d="M58 90 L74 96 C72 130 78 156 92 190 L60 170 Z" fill="#7a5239" opacity=".45"/>
  <path d="M66 118 Q80 138 96 150" stroke="#8d6246" stroke-width="10" stroke-linecap="round" fill="none" opacity=".2"/>
  <path d="M120 120 Q132 128 138 114" stroke="#fff3e6" stroke-width="7" stroke-linecap="round" fill="none" opacity=".28"/>
  <path d="M66 164 L96 192 L130 160 L134 190 L70 190 Z" fill="#5d3f2e" opacity=".3"/>
  <path d="M96 100 Q94 126 94 140 Q90 146 96 148 Q104 150 108 146 Q112 142 106 138 Q104 124 104 108" fill="#9c6d4f" opacity=".26"/>
  <path d="M101 104 Q100 126 101 138" stroke="#f6dcc2" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>
  <path d="M141 80 Q146 120 134 158" fill="none" stroke="url(#${u}r)" stroke-width="7" opacity=".9"/>
 </g>
 <path d="M91 146 Q97 150 103 148" stroke="#6b4331" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
 <path d="M70 160 L90 186 Q100 192 112 186 L134 158" fill="none" stroke="#c8f6ff" stroke-width="1.4" opacity=".18" stroke-linejoin="round"/>
 <g class="mg-eyes">
  <g class="mg-eye mg-eye-l">
   <path d="M64 107.5 Q72 105.5 80 106 Q90 106.5 96 111 Q90 114 80 113.6 Q69 113 64 107.5 Z" fill="#f2ece6"/>
   <g class="mg-ball" clip-path="url(#${u}el)"><circle cx="81" cy="109.6" r="4.4" fill="url(#${u}i)"/><circle cx="81" cy="109.6" r="1.9" fill="#0a1a22"/><circle cx="79.6" cy="108.2" r="1" fill="#fff"/></g>
   <path d="M62 106 Q74 99 97 108.5 L96.5 111 Q90 106 80 105.2 Q71 105 63.5 107.5 Z" fill="#a9754f" opacity=".7"/>
   <path d="M63.5 107.2 Q72 104.4 80 104.9 Q90 105.4 96.5 110.8" fill="none" stroke="#1c1412" stroke-width="2.8" stroke-linecap="round"/>
   <path d="M66 114.6 Q80 117 94 113" stroke="#9c6d4f" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>
  </g>
  <g class="mg-eye mg-eye-r">
   <path d="M106 111 Q113 106.5 122 106 Q131 106 138 107 Q132 113.6 121 113.6 Q111 113.6 106 111 Z" fill="#f2ece6"/>
   <g class="mg-ball" clip-path="url(#${u}er)"><circle cx="121" cy="109.6" r="4.4" fill="url(#${u}i)"/><circle cx="121" cy="109.6" r="1.9" fill="#0a1a22"/><circle cx="119.6" cy="108.2" r="1" fill="#fff"/></g>
   <path d="M104 111 Q112 104.5 122 104.6 Q132 104.6 140.5 105 L139 107 Q131 105.4 122 105.2 Q113 105.4 105.5 111 Z" fill="#b98760" opacity=".7"/>
   <path d="M105.5 110.8 Q113 105 122 105 Q131 105 139 106.2" fill="none" stroke="#1c1412" stroke-width="2.8" stroke-linecap="round"/>
   <path d="M139 106.2 L142 103.6" stroke="#1c1412" stroke-width="2.2" stroke-linecap="round"/>
   <path d="M108 114.6 Q122 117 136 112" stroke="#b27a5d" stroke-width="1.4" fill="none" opacity=".4" stroke-linecap="round"/>
  </g>
 </g>
 <g class="mg-brow mg-brow-l"><path d="M62 101 Q76 94 95 99" fill="none" stroke="#2a1f1b" stroke-width="5.2" stroke-linecap="round"/></g>
 <g class="mg-brow mg-brow-r"><path d="M106 98 Q124 91 142 98" fill="none" stroke="#2a1f1b" stroke-width="5.2" stroke-linecap="round"/></g>
 <g class="mg-mouth">
  <path class="mg-m mg-m-neutral" d="M88 166 Q100 169 112 166" fill="none" stroke="#7a3f3a" stroke-width="3" stroke-linecap="round"/>
  <path class="mg-m mg-m-smirk" d="M88 167 Q102 168 114 160" fill="none" stroke="#7a3f3a" stroke-width="3" stroke-linecap="round"/>
  <path class="mg-m mg-m-impressed" d="M89 166 Q101 170 112 164" fill="none" stroke="#7a3f3a" stroke-width="3" stroke-linecap="round"/>
  <g class="mg-m mg-m-shocked"><ellipse cx="100" cy="169" rx="7" ry="8.5" fill="#4a1d1f"/><path d="M94 164 Q100 162 106 164" stroke="#f6f1ec" stroke-width="3" fill="none"/></g>
  <path class="mg-m mg-m-disappointed" d="M89 171 Q100 163 112 171" fill="none" stroke="#7a3f3a" stroke-width="3" stroke-linecap="round"/>
  <path d="M92 177 Q100 180 108 177" stroke="#b27a5d" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
 </g>
 <g class="mg-hair">
  <path d="M54 112 C42 62 66 30 104 29 C142 29 162 64 148 110 L145 98 C143 84 138 76 130 70 C116 78 98 80 86 72 C80 76 74 82 70 90 C66 98 64 106 62 118 Z" fill="url(#${u}h)"/>
  <path d="M84 72 C98 80 122 76 132 68 C128 60 118 55 108 54 C96 54 88 60 84 72 Z" fill="#2c211e"/>
  <path d="M100 36 C86 40 76 50 72 62 M112 34 C100 42 94 52 92 62 M126 38 C116 46 112 54 112 60 M138 44 C132 52 130 58 130 64 M88 38 C78 46 70 58 68 72" fill="none" stroke="#5b463d" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>
  <path d="M96 66 C104 64 112 62 120 58 M110 70 C118 68 124 66 130 62" fill="none" stroke="#1a1311" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M60 106 L58 124 M146 104 L144 122" stroke="#1d1614" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  <path d="M138 34 C150 44 156 62 150 88" fill="none" stroke="url(#${u}r)" stroke-width="5" opacity=".9"/>
 </g>
</g>
</g>
<g clip-path="url(#${u}c)"><rect class="mg-sweep" x="-60" y="0" width="60" height="240" fill="url(#${u}w)" transform="skewX(-14)"/></g>
</svg>`;
  }

  function set(root, expr) {
    if (!root || !EXPR.includes(expr)) return;
    (root.matches && root.matches("svg.mg") ? [root] : [...root.querySelectorAll("svg.mg")]).forEach((s) => { s.dataset.expr = expr; });
  }

  // Cheap camera-flash burst: a white wash plus a few star glints, transform/opacity only.
  function flash(el, n) {
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = document.createElement("div");
    box.className = "mg-flash";
    box.setAttribute("aria-hidden", "true");
    const k = reduce ? 1 : (n || 4);
    let html = "";
    for (let i = 0; i < k; i++) {
      const x = 12 + Math.random() * 76, y = 10 + Math.random() * 60, d = i * 140 + Math.random() * 80;
      html += `<i style="left:${x}%;top:${y}%;--d:${d}ms"></i>`;
    }
    box.innerHTML = html;
    el.appendChild(box);
    setTimeout(() => box.remove(), 1400 + k * 160);
  }

  // Photoshoot set: backdrop, two softboxes, floor glow, the guy, occasional shutter flashes.
  function hero(el) {
    if (!el || el.dataset.mgHero) return;
    el.dataset.mgHero = "1";
    el.classList.add("mg-set");
    el.innerHTML = `<div class="mg-bk"></div><div class="mg-box mg-box-l"></div><div class="mg-box mg-box-r"></div><div class="mg-floor"></div><div class="mg-guy">${svg(270, "smirk")}</div><span class="mg-tag"><i></i>MOG CHECK READY</span>`;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    const loop = () => {
      if (!el.isConnected) return;
      if (!document.hidden && el.offsetParent) {
        flash(el, 2);
        const g = el.querySelector("svg.mg");
        if (g) { set(g, ++n % 3 === 0 ? "impressed" : "smirk"); }
      }
      setTimeout(loop, 5200 + Math.random() * 2600);
    };
    setTimeout(loop, 2600);
  }


  // ---- Static bust canvases for the canvas scene (scene.js): self-contained SVG -> image -> canvas with a soft bottom fade.
  const POSE = {
    neutral: "", smirk: ".mg-brow-r{transform:translateY(-1.5px) rotate(-3deg)}.mg-eye{transform:scaleY(.9)}",
    impressed: ".mg-brow-r{transform:translateY(-7px) rotate(-7deg)}.mg-brow-l{transform:translateY(-1px)}",
    shocked: ".mg-brow{transform:translateY(-8px)}.mg-eye{transform:scale(1.12,1.35)}",
    disappointed: ".mg-brow-l{transform:translateY(2px) rotate(-11deg)}.mg-brow-r{transform:translateY(2px) rotate(11deg)}.mg-eye{transform:scaleY(.72)}.mg-head{transform:rotate(-3deg) translateY(3px);transform-origin:100px 200px;transform-box:view-box}",
  };
  const busts = {};
  function bust(expr) {
    if (!EXPR.includes(expr)) expr = "smirk";
    if (busts[expr]) return busts[expr].ready ? busts[expr].c : null;
    const rec = busts[expr] = { ready: false, c: document.createElement("canvas") };
    const W = 300, H = 360;
    rec.c.width = W; rec.c.height = H;
    let s = svg(W, expr, { idle: false }).replace(/ class="mg[^"]*"/, "").replace(/ style="[^"]*"/, "");
    s = s.replace('xmlns', 'xmlns').replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
    s = s.replace("<defs>", `<style>*{transform-box:fill-box;transform-origin:center}.mg-m{opacity:0}.mg-m-${expr}{opacity:1}.mg-sweep{display:none}${POSE[expr]}</style><defs>`);
    const img = new Image();
    img.onload = () => {
      const x = rec.c.getContext("2d");
      x.drawImage(img, 0, 0, W, H);
      x.globalCompositeOperation = "destination-in";
      const g = x.createLinearGradient(0, H * 0.72, 0, H);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      rec.ready = true;
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
    return null;
  }

  EXPR.forEach((e) => bust(e));
  window.ModelGuy = { svg, set, flash, hero, bust, EXPR };
})();
