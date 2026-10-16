// Panel "Herramental": tarjetas por nivel de herramental (dado de doblez, mordaza, dado de presión,
// limpiador), mandril y boquilla, costo del juego y un esquema en planta a escala del cabezal.
import { h, svg, setChildren, fmt, fmtMm, fmtDeg, fmtMoney, r2 } from '../format.js';

export const id = 'herramental';
export const title = 'Herramental';

const MANDREL_TYPE = { none: 'Sin mandril', plug: 'Tapón (mandril liso)', ball: 'Mandril de bolas' };

function kv(rows) {
  return h('dl', { class: 'pnl-kv' }, rows.filter(Boolean).map(([k, v]) => [h('dt', null, k), h('dd', null, v)]));
}

function card(head, sub, ...body) {
  return h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, head), sub ? h('span', { class: 'pnl-card-sub' }, sub) : null),
    ...body);
}

function subhead(text, extra) {
  return h('h4', { class: 'pnl-subhead' }, text, extra ? h('span', { class: 'pnl-muted' }, ' · ', extra) : null);
}

// ── Esquema en planta (corte a la altura de la ranura) ────────────────────────────────────────
// Marco de máquina (docs/INTERFACES.md §3): tangencia en el origen, avance +X, centro del dado en
// z = −CLR, mordaza y dado de presión del lado +Z, limpiador del lado −Z. En pantalla: x → derecha,
// +Z → arriba (y_svg = −z).
function schematic(stack, plan, OD, wall) {
  const { bendDie: bd, clampDie: cd, pressureDie: pd, wiperDie: wd, clr } = stack;
  const m = plan.mandrel;
  const R = OD / 2;
  const groove = bd.grooveR ?? R;
  const dieR = clr - groove; // radio del fondo de la ranura
  const nose = m.type !== 'none' ? m.noseProjection : 0;
  const ballsEnd = m.type === 'ball' ? nose + m.balls * m.pitch : nose;
  const xMin = -pd.length - 0.12 * OD;
  const xMax = Math.max(cd.length, bd.clampLength, ballsEnd) + 0.5 * OD;
  const zTop = R + Math.max(cd.width, pd.width) + 0.9 * OD; // espacio para cotas
  const zBot = -clr - bd.outerR;
  const W = xMax - xMin, H = zTop - zBot;
  const pad = 0.04 * W;
  const fs = W / 400 * 11; // ≈ 11 px cuando el SVG mide ~400 px
  const X = (x) => r2(x), Y = (z) => r2(-z);
  const g = [];

  // Dado de doblez: brida (contorno exterior, línea discontinua), cuerpo en la ranura, cubo, inserto recto.
  g.push(svg('circle', { cx: 0, cy: Y(-clr), r: r2(bd.outerR), class: 'sch-die-flange' }));
  g.push(svg('path', {
    class: 'sch-die',
    d: `M0 ${Y(-clr)} L0 ${Y(-clr + dieR)} L${X(bd.clampLength)} ${Y(-groove)} L${X(bd.clampLength)} ${Y(-clr)} Z`,
  }));
  g.push(svg('circle', { cx: 0, cy: Y(-clr), r: r2(dieR), class: 'sch-die' }));
  g.push(svg('rect', { x: 0, y: Y(-groove), width: X(bd.clampLength), height: r2(clr - groove), class: 'sch-die sch-nostroke' }));
  g.push(svg('circle', { cx: 0, cy: Y(-clr), r: r2(bd.hubR), class: 'sch-hub' }));
  g.push(svg('path', { d: `M${-fs} ${Y(-clr)}H${fs}M0 ${Y(-clr) - fs}V${Y(-clr) + fs}`, class: 'sch-center' }));

  // Limpiador: cuña del lado −Z detrás de la tangencia, apoyada en el dado.
  if (wd.required) {
    const tip = wd.tipOffset ?? 0, L = wd.length;
    const pts = [];
    const n = 16;
    for (let k = 0; k <= n; k++) {
      const x = -tip - (L - tip) * k / n;
      const zc = -clr + Math.sqrt(Math.max(0, dieR * dieR - x * x)); // superficie del dado
      const zLow = Math.max(zc, -groove - 0.45 * OD);
      pts.push([x, Math.min(-groove, zLow)]);
    }
    const d = `M${X(-tip)} ${Y(-groove)} L${X(-L)} ${Y(-groove)} ` + pts.reverse().map(([x, z]) => `L${X(x)} ${Y(z)}`).join(' ') + ' Z';
    g.push(svg('path', { d, class: 'sch-wiper' }));
  }

  // Mordaza (+Z, delante de la tangencia) y dado de presión (+Z, detrás).
  g.push(svg('rect', { x: 0, y: Y(R + cd.width), width: X(cd.length), height: r2(cd.width), class: cd.serrated ? 'sch-clamp sch-serrated' : 'sch-clamp' }));
  g.push(svg('rect', { x: X(-pd.length), y: Y(R + pd.width), width: X(pd.length), height: r2(pd.width), class: 'sch-pdie' }));

  // Tubo recto (paredes a escala) y mandril.
  const tx0 = xMin + 0.06 * OD, tx1 = xMax - 0.2 * OD;
  g.push(svg('rect', { x: X(tx0), y: Y(R), width: r2(tx1 - tx0), height: r2(OD), class: 'sch-tube-bore' }));
  g.push(svg('rect', { x: X(tx0), y: Y(R), width: r2(tx1 - tx0), height: r2(wall), class: 'sch-tube' }));
  g.push(svg('rect', { x: X(tx0), y: Y(-R + wall), width: r2(tx1 - tx0), height: r2(wall), class: 'sch-tube' }));
  if (m.type !== 'none') {
    const rm = m.diameter / 2;
    const sx0 = Math.max(tx0, nose - m.shankLength);
    g.push(svg('rect', { x: X(sx0), y: Y(rm), width: r2(nose - sx0), height: r2(2 * rm), class: 'sch-mandrel' }));
    if (m.type === 'ball') {
      g.push(svg('path', { d: `M${X(nose)} 0H${X(ballsEnd - m.pitch / 2)}`, class: 'sch-link' }));
      const w2 = m.ballWidth / 2, yc = Math.sqrt(Math.max(0, rm * rm - w2 * w2));
      for (let k = 1; k <= m.balls; k++) {
        const cx = nose + (k - 0.5) * m.pitch;
        g.push(svg('path', {
          class: 'sch-mandrel',
          d: `M${X(cx - w2)} ${Y(yc)} L${X(cx - w2)} ${Y(-yc)} A${r2(rm)} ${r2(rm)} 0 0 0 ${X(cx + w2)} ${Y(-yc)} L${X(cx + w2)} ${Y(yc)} A${r2(rm)} ${r2(rm)} 0 0 0 ${X(cx - w2)} ${Y(yc)} Z`,
        }));
      }
    }
  }

  // Línea de tangencia.
  g.push(svg('path', { d: `M0 ${Y(zTop - 0.25 * OD)}V${Y(-clr)}`, class: 'sch-tangent' }));
  g.push(svg('text', { x: r2(0.25 * fs), y: Y(zTop - 0.25 * OD) + fs, class: 'sch-label', 'font-size': r2(fs * 0.9) }, 'T'));

  // Cotas.
  const dim = (x0, x1, z, label) => {
    const y = Y(z), a = fs * 0.45;
    return svg('g', { class: 'sch-dim' },
      svg('path', { d: `M${X(x0)} ${y}H${X(x1)}M${X(x0)} ${r2(y - a)}V${r2(y + a)}M${X(x1)} ${r2(y - a)}V${r2(y + a)}` }),
      svg('path', { class: 'sch-arrow', d: `M${X(x0)} ${y}l${r2(a * 1.6)} ${r2(-a * 0.6)}v${r2(a * 1.2)}ZM${X(x1)} ${y}l${r2(-a * 1.6)} ${r2(-a * 0.6)}v${r2(a * 1.2)}Z` }),
      svg('text', { x: X((x0 + x1) / 2), y: r2(y - 0.35 * fs), 'text-anchor': 'middle', 'font-size': r2(fs) }, label));
  };
  const zDim = R + Math.max(cd.width, pd.width) + 0.45 * OD;
  g.push(dim(0, cd.length, zDim, `Mordaza ${fmt(cd.length, 1)}`));
  g.push(dim(-pd.length, 0, zDim, `Dado de presión ${fmt(pd.length, 1)}`));
  // CLR: radio del centro del dado a la línea de centro del tubo, a 35° para no tapar la tangencia.
  const ang = 35 * Math.PI / 180;
  const ex = -clr * Math.sin(ang), ez = -clr + clr * Math.cos(ang);
  g.push(svg('g', { class: 'sch-dim' },
    svg('path', { d: `M0 ${Y(-clr)}L${X(ex)} ${Y(ez)}` }),
    svg('circle', { cx: X(ex), cy: Y(ez), r: r2(fs * 0.25), class: 'sch-dot' }),
    svg('text', { x: X(ex * 0.55 - 0.4 * fs), y: Y(-clr + (ez + clr) * 0.55), 'text-anchor': 'end', 'font-size': r2(fs) }, `CLR ${fmt(clr, 1)}`)));
  // Etiquetas de piezas.
  const lab = (x, z, text, anchor = 'middle') => svg('text', { x: X(x), y: Y(z), 'text-anchor': anchor, class: 'sch-label', 'font-size': r2(fs * 0.85) }, text);
  g.push(lab(-clr * 0.0, -clr - dieR * 0.55, 'Dado de doblez'));
  if (wd.required) g.push(lab(-wd.length - 0.4 * fs, -groove - 0.3 * OD, 'Limpiador', 'end'));
  if (m.type !== 'none') g.push(lab(Math.max(tx0, nose - m.shankLength) + fs * 0.5, -m.diameter / 2 + fs * 1.1 > 0 ? 0 : -fs * 0.3, 'Mandril', 'start'));

  const vb = `${r2(xMin - pad)} ${r2(-zTop - pad)} ${r2(W + 2 * pad)} ${r2(H + 2 * pad)}`;
  return svg('svg', { class: 'pnl-svg sch', viewBox: vb, role: 'img', 'aria-label': `Esquema en planta del nivel ${stack.level}` }, ...g);
}

export function mount(el, ctx) {
  el.classList.add('pnl', 'pnl-herramental');
  const tabsEl = h('div', { class: 'pnl-chips', role: 'tablist' });
  const schemEl = h('div', { class: 'pnl-figure' });
  const cardsEl = h('div', { class: 'pnl-stack' });
  el.append(h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Esquema en planta del cabezal'), h('span', { class: 'pnl-card-sub' }, 'a escala · mm')),
    tabsEl, schemEl,
    h('p', { class: 'pnl-note' }, 'Corte a la altura de la ranura; posición de carga (antes de doblar). T = punto de tangencia.')),
  cardsEl);

  let cur = ctx;
  let lastKey = null, lastBend, stackSel = null;

  function render() {
    const { plan, tube, cost, analysis } = cur;
    if (!plan || !tube) { setChildren(cardsEl, h('p', { class: 'pnl-empty' }, 'Sin datos de proceso.')); setChildren(schemEl); setChildren(tabsEl); return; }
    const OD = tube.OD;
    const stacks = plan.stacks;
    const st = stacks[Math.min(stackSel ?? 0, stacks.length - 1)];
    const bendsOf = (lvl) => plan.bends.filter((b) => b.stack === lvl).map((b) => b.index + 1);
    const wallOf = (lvl) => {
      const ws = (analysis?.bends ?? plan.bends).filter((b, i) => plan.bends[i].stack === lvl).map((b) => b.wall).filter(Number.isFinite);
      return ws.length ? Math.min(...ws) : (tube.nominalWall ?? 1.5);
    };

    setChildren(tabsEl, stacks.map((s, i) => h('button', {
      type: 'button', role: 'tab', class: 'pnl-chip' + (s === st ? ' is-on' : ''), 'aria-selected': String(s === st),
      onclick: () => { stackSel = i; render(); },
    }, `Nivel ${s.level} · CLR ${fmt(s.clr, 1)}`)));
    setChildren(schemEl, schematic(st, plan, OD, wallOf(st.level)));

    const money = (v) => (cost ? fmtMoney(v, cost.currency, 0) : '—');
    const cards = [];
    for (const s of stacks) {
      const { bendDie: bd, clampDie: cd, pressureDie: pd, wiperDie: wd } = s;
      cards.push(card(`Nivel ${s.level} · CLR ${fmtMm(s.clr)}`, `${fmt(s.clr / OD, 2)}×DE · dobleces ${bendsOf(s.level).join(', ') || '—'}`,
        subhead('Dado de doblez'),
        kv([
          ['CLR', fmtMm(bd.clr)],
          ['Radio de ranura', fmtMm(bd.grooveR, 2)],
          ['Radio exterior', fmtMm(bd.outerR)],
          ['Radio de cubo', fmtMm(bd.hubR)],
          ['Altura', fmtMm(bd.height)],
          ['Inserto de sujeción', fmtMm(bd.clampLength)],
          ['Altura de ranura', fmtMm(s.yOffset)],
        ]),
        subhead('Mordaza', cd.serrated ? 'estriada' : 'lisa'),
        kv([['Longitud', fmtMm(cd.length)], ['Altura', fmtMm(cd.height)], ['Ancho', fmtMm(cd.width)], ['Superficie', cd.serrated ? 'Estriada (mayor agarre)' : 'Lisa']]),
        subhead('Dado de presión'),
        kv([['Longitud', fmtMm(pd.length)], ['Altura', fmtMm(pd.height)], ['Ancho', fmtMm(pd.width)]]),
        subhead('Limpiador', wd.required ? 'requerido' : 'no requerido'),
        wd.required
          ? kv([['Longitud', fmtMm(wd.length)], ['Ángulo de ataque (rake)', fmtDeg(wd.rake, 1)], ['Punta detrás de tangencia', fmtMm(wd.tipOffset, 2)], ['Espesor de filo', fmtMm(wd.thickness, 2)]])
          : h('p', { class: 'pnl-note' }, 'No se requiere limpiador para este nivel (DE/t y CLR/DE dentro del rango sin limpiador).'),
      ));
    }

    // Mandril
    const m = plan.mandrel;
    const mNote = [];
    if (m.type !== 'none') {
      if (tube.variableWall) {
        const tMax = tube.maxWall, tMin = tube.minWall;
        const clr = (analysis?.bends ?? []).map((b) => b.mandrelClearance).filter(Number.isFinite);
        mNote.push(h('p', { class: 'pnl-note pnl-note-warn' },
          `Pared variable (${fmtMm(tMin, 2)} – ${fmtMm(tMax, 2)}): el mandril se dimensiona al DI mínimo que pasa por la tangencia `
          + `(DE − 2·t máx = ${fmtMm(OD - 2 * tMax, 2)}) menos la holgura; en las zonas delgadas la holgura local crece`
          + (clr.length ? ` (hasta ${fmtMm(Math.max(...clr), 2)} en los dobleces)` : '') + ', lo que aumenta la ovalidad.'));
      } else {
        mNote.push(h('p', { class: 'pnl-note' }, `Dimensionado al DI = DE − 2·t = ${fmtMm(m.diameter + m.clearance, 2)} menos la holgura diametral.`));
      }
    }
    cards.push(card('Mandril', MANDREL_TYPE[m.type] ?? m.type,
      m.type === 'none'
        ? h('p', { class: 'pnl-note' }, 'No se requiere mandril para la relación DE/t y CLR/DE de esta pieza.')
        : kv([
          ['Tipo', MANDREL_TYPE[m.type]],
          ['Diámetro', fmtMm(m.diameter, 2)],
          ['Holgura diametral', fmtMm(m.clearance, 2)],
          m.type === 'ball' ? ['Bolas', String(m.balls)] : null,
          m.type === 'ball' ? ['Paso', fmtMm(m.pitch)] : null,
          m.type === 'ball' ? ['Ancho de bola', fmtMm(m.ballWidth)] : null,
          ['Vástago', fmtMm(m.shankLength)],
          ['Proyección de nariz', fmtMm(m.noseProjection)],
          ['Retracción', fmtMm(m.retract)],
          ['Varilla', fmtMm(m.rodLength, 0)],
          cost ? ['Costo', money(cost.tooling.mandrel)] : null,
        ]),
      ...mNote));

    cards.push(card('Boquilla (collet)', null,
      kv([['Longitud de sujeción', fmtMm(plan.collet.gripLength)], ['DE de boquilla', fmtMm(plan.collet.OD)], cost ? ['Costo', money(cost.tooling.collet)] : null])));

    if (cost) {
      const t = cost.tooling;
      const rows = [['bendDie', 'Dados de doblez'], ['clampDie', 'Mordazas'], ['pressureDie', 'Dados de presión'], ['wiperDie', 'Limpiadores'], ['mandrel', 'Mandril'], ['collet', 'Boquilla']];
      const perPart = (v) => (t.total > 0 ? cost.perPart.tooling * v / t.total : 0);
      cards.push(card('Costo de herramental', `juego completo · vida ${fmt(t.life, 0)} piezas`,
        h('div', { class: 'pnl-scroll' }, h('table', { class: 'pnl-table' },
          h('thead', null, h('tr', null, h('th', null, 'Concepto'), h('th', { class: 'num' }, 'Juego'), h('th', { class: 'num' }, 'Por pieza'))),
          h('tbody', null, rows.map(([k, label]) => h('tr', null, h('td', null, label), h('td', { class: 'num' }, money(t[k])), h('td', { class: 'num' }, fmtMoney(perPart(t[k]), cost.currency, 3))))),
          h('tfoot', null, h('tr', null, h('th', null, 'Total'), h('th', { class: 'num' }, money(t.total)), h('th', { class: 'num' }, fmtMoney(cost.perPart.tooling, cost.currency, 3))))))));
    }
    setChildren(cardsEl, ...cards);
  }

  function update(ctx2) {
    cur = ctx2;
    const bend = ctx2.selection?.bend ?? null;
    if (bend !== lastBend) {
      lastBend = bend;
      const pb = bend != null ? ctx2.plan?.bends?.[bend] : null;
      if (pb) { stackSel = ctx2.plan.stacks.findIndex((s) => s.level === pb.stack); if (stackSel < 0) stackSel = 0; }
    }
    const key = [ctx2.plan, ctx2.cost, ctx2.analysis, ctx2.tube, stackSel];
    if (lastKey && key.every((v, i) => v === lastKey[i])) return;
    lastKey = key;
    render();
  }
  update(ctx);
  return { update, dispose() { el.textContent = ''; el.classList.remove('pnl', 'pnl-herramental'); } };
}
