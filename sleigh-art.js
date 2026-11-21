/*
  Full-colour Santa, sleigh and reindeer drawn with smooth canvas shapes.
  SleighArt.draw(ctx, x, y, s, t): (x, y) is the sleigh; the team runs to the left. s = scale, t = time (seconds).
  Shared by the title scene and the reward animation.
*/
(() => {
  "use strict";
  const C = {
    fur: "#8a5a36", furDark: "#5e3a20", belly: "#d2ad82", hoof: "#2b1d18", antler: "#e3cda4",
    red: "#d23b3b", redDark: "#931f24", gold: "#f2c14e", goldDark: "#b8892a", white: "#fbf7ef", skin: "#f1c19c",
    black: "#1d1512", sack: "#9a6a3e", green: "#2f8a4e", blue: "#3f7fc4",
  };
  const ell = (ctx, x, y, rx, ry, rot, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, 6.283); ctx.fill(); };

  function reindeer(ctx, x, y, s, ph, lead) {
    const legs = [[-6, Math.sin(ph) * 0.65], [-3, -Math.sin(ph) * 0.5], [6, -Math.sin(ph) * 0.65], [9, Math.sin(ph) * 0.5]];
    ctx.lineCap = "round";
    legs.forEach(([lx, a], i) => {                       // back legs drawn darker for depth
      ctx.strokeStyle = i % 2 ? C.furDark : "#6b4429";
      ctx.lineWidth = 2.1 * s;
      const kx = x + lx * s + Math.sin(a) * 3.5 * s, ky = y + 5 * s;
      ctx.beginPath(); ctx.moveTo(x + lx * s, y + 2 * s); ctx.lineTo(kx, ky); ctx.lineTo(kx + Math.sin(a * 1.6) * 3 * s, ky + 4.5 * s); ctx.stroke();
      ell(ctx, kx + Math.sin(a * 1.6) * 3 * s, ky + 4.8 * s, 1.3 * s, 0.9 * s, 0, C.hoof);
    });
    const g = ctx.createLinearGradient(x, y - 4 * s, x, y + 4 * s);
    g.addColorStop(0, "#a06a40"); g.addColorStop(1, C.furDark);
    ell(ctx, x + 1.5 * s, y, 9 * s, 4 * s, -0.08, g);   // body
    ell(ctx, x + 1.5 * s, y + 1.8 * s, 6 * s, 1.8 * s, -0.08, C.belly);
    ell(ctx, x + 10 * s, y - 1.5 * s, 1.6 * s, 1.3 * s, 0, C.white);   // tail
    ctx.fillStyle = "#94603a";                          // neck
    ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 1.5 * s); ctx.lineTo(x - 10.5 * s, y - 7.5 * s); ctx.lineTo(x - 8 * s, y - 9 * s); ctx.lineTo(x - 2.5 * s, y - 2.5 * s); ctx.fill();
    ell(ctx, x - 12 * s, y - 8.3 * s, 3.6 * s, 2.2 * s, -0.2, "#9c6a42");   // head
    ell(ctx, x - 9.6 * s, y - 10.2 * s, 1.4 * s, 0.7 * s, -0.7, "#7a4c2c");   // ear
    ell(ctx, x - 12.6 * s, y - 9 * s, 0.6 * s, 0.6 * s, 0, C.black);         // eye
    ctx.strokeStyle = C.antler; ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(x - 10.6 * s, y - 10.2 * s); ctx.lineTo(x - 9.4 * s, y - 15.5 * s); ctx.lineTo(x - 6.6 * s, y - 16.6 * s);
    ctx.moveTo(x - 9.9 * s, y - 13.4 * s); ctx.lineTo(x - 12.4 * s, y - 15.4 * s);
    ctx.moveTo(x - 9.5 * s, y - 15 * s); ctx.lineTo(x - 8.4 * s, y - 18 * s);
    ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 1.4 * s;   // harness with a bell
    ctx.beginPath(); ctx.moveTo(x - 7.5 * s, y - 3.5 * s); ctx.lineTo(x - 4 * s, y + 1.5 * s); ctx.stroke();
    ell(ctx, x - 5.4 * s, y - 0.6 * s, 1 * s, 1 * s, 0, C.gold);
    const nx = x - 15.4 * s, ny = y - 8.4 * s;
    if (lead) {                                         // Rudolph
      const r = ctx.createRadialGradient(nx, ny, 0, nx, ny, 10 * s);
      r.addColorStop(0, "rgba(255,70,70,0.85)"); r.addColorStop(1, "rgba(255,70,70,0)");
      ctx.fillStyle = r; ctx.beginPath(); ctx.arc(nx, ny, 10 * s, 0, 6.283); ctx.fill();
      ell(ctx, nx, ny, 1.7 * s, 1.7 * s, 0, "#ff3b3b");
    } else ell(ctx, nx, ny, 1 * s, 0.9 * s, 0, C.black);
  }

  function sleigh(ctx, x, y, s) {
    // Sack of presents behind Santa.
    ell(ctx, x + 14 * s, y - 12 * s, 6 * s, 7 * s, 0.2, C.sack);
    [[11, -19, C.green], [16, -20, C.blue], [13.5, -22, C.red]].forEach(([gx, gy, col]) => {
      ctx.fillStyle = col; ctx.fillRect(x + gx * s, y + gy * s, 4 * s, 4 * s);
      ctx.fillStyle = C.gold; ctx.fillRect(x + (gx + 1.6) * s, y + gy * s, 0.8 * s, 4 * s);
    });
    // Santa.
    ell(ctx, x + 6 * s, y - 11 * s, 5.5 * s, 6 * s, 0, C.red);           // coat
    ctx.fillStyle = C.black; ctx.fillRect(x + 1 * s, y - 9.5 * s, 10.5 * s, 1.6 * s);   // belt
    ctx.fillStyle = C.gold; ctx.fillRect(x + 5 * s, y - 9.9 * s, 2.2 * s, 2.4 * s);
    ell(ctx, x + 4.5 * s, y - 18.5 * s, 3 * s, 3 * s, 0, C.skin);        // face
    ell(ctx, x + 4 * s, y - 16 * s, 3.4 * s, 2.6 * s, 0, C.white);       // beard
    ctx.fillStyle = C.red;                                                // hat
    ctx.beginPath(); ctx.moveTo(x + 1.2 * s, y - 20 * s); ctx.lineTo(x + 7.8 * s, y - 20 * s); ctx.lineTo(x + 10.5 * s, y - 25 * s); ctx.fill();
    ctx.fillStyle = C.white; ctx.fillRect(x + 1 * s, y - 21 * s, 7 * s, 1.8 * s);
    ell(ctx, x + 10.8 * s, y - 25.2 * s, 1.4 * s, 1.4 * s, 0, C.white);
    ell(ctx, x + 1 * s, y - 12 * s, 1.6 * s, 3.2 * s, 0.5, C.redDark);   // arm holding the reins
    ell(ctx, x - 0.6 * s, y - 9.6 * s, 1.2 * s, 1.1 * s, 0, C.white);   // glove cuff
    // Sleigh body: red with darker shading and gold trim, curled front.
    const g = ctx.createLinearGradient(x, y - 10 * s, x, y + 3 * s);
    g.addColorStop(0, C.red); g.addColorStop(1, C.redDark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 9 * s, y + 2 * s);
    ctx.quadraticCurveTo(x - 14 * s, y - 2 * s, x - 11 * s, y - 9 * s);
    ctx.quadraticCurveTo(x - 7 * s, y - 12 * s, x - 6 * s, y - 7 * s);
    ctx.lineTo(x + 16 * s, y - 7 * s);
    ctx.quadraticCurveTo(x + 21 * s, y - 8 * s, x + 19 * s, y + 2 * s);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.2 * s;
    ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 6.5 * s); ctx.lineTo(x + 16.5 * s, y - 6.5 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - 9.2 * s, y - 7.5 * s, 2 * s, 0, 6.283); ctx.stroke();   // front curl
    // Golden runners.
    ctx.strokeStyle = C.goldDark; ctx.lineWidth = 1 * s;
    [[-4, 2], [12, 2]].forEach(([rx]) => { ctx.beginPath(); ctx.moveTo(x + rx * s, y + 2 * s); ctx.lineTo(x + rx * s, y + 5.5 * s); ctx.stroke(); });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.6 * s;
    ctx.beginPath(); ctx.moveTo(x - 13 * s, y + 2.5 * s); ctx.quadraticCurveTo(x - 16 * s, y + 6.5 * s, x - 9 * s, y + 6 * s); ctx.lineTo(x + 20 * s, y + 6 * s); ctx.stroke();
  }

  // Whole team: three reindeer and Rudolph out front, reins, and the sleigh.
  function draw(ctx, x, y, s, t) {
    const gal = t * 11;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(242,193,78,0.8)"; ctx.lineWidth = 0.8 * s;
    ctx.beginPath(); ctx.moveTo(1 * s, -10 * s); ctx.quadraticCurveTo(-40 * s, 0, -84 * s, -9 * s); ctx.stroke();
    [[-86, -7, 4.2, true], [-66, -5, 2.8, false], [-46, -3, 1.4, false], [-26, 0, 0, false]]
      .forEach(([dx, dy, ph, lead]) => reindeer(ctx, dx * s, dy * s + Math.sin(gal + ph) * 0.8 * s, s * 0.9, gal + ph, lead));
    sleigh(ctx, 0, 0, s);
    ctx.restore();
  }

  window.SleighArt = { draw, width: 112, height: 34 };   // size of the whole team in scale units
})();
