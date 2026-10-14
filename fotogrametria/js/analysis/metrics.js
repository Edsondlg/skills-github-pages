// Métricas de calidad ("porcentajes de efectividad"), incertidumbre estimada y recomendaciones.
import { median, mean } from '../core/linalg.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x));
// Puntuación lineal: 1 si v <= good, 0 si v >= bad (o al revés si higherIsBetter).
function score(v, good, bad) {
  if (v === null || v === undefined || !isFinite(v)) return null;
  if (good < bad) return clamp01((bad - v) / (bad - good));
  return clamp01((v - bad) / (good - bad));
}

export function computeMetrics({ project, recon = null, cad = null, target = 1.0, holes = null }) {
  const photos = project.photos;
  const cal = project.calib;
  const board = project.board;
  const M = { items: [], scores: {}, recs: [], target };
  const add = (group, key, label, value, unit = '', sc = null, note = '') => {
    M.items.push({ group, key, label, value, unit, score: sc, note });
    if (sc !== null && sc !== undefined) M.scores[key] = sc;
  };
  // ---------- Fotos ----------
  const total = photos.length;
  const processed = photos.filter(p => p.dets);
  const reg = photos.filter(p => p.registered);
  const regFrac = total ? reg.length / total : 0;
  add('Fotos', 'registro', 'Fotos registradas', 100 * regFrac, '%', regFrac, `${reg.length} de ${total}`);
  if (processed.length) {
    const nm = processed.map(p => p.nMat || 0);
    const meanMk = mean(nm);
    add('Fotos', 'marcadores', 'Marcadores del tapete por foto (promedio)', meanMk, '', score(meanMk, 14, 3), `de ${board.markers.length} en el tapete`);
    const sh = processed.map(p => p.sharp || 0);
    const medSh = median(sh);
    const blurry = processed.filter(p => (p.sharp || 0) < 0.35 * medSh);
    const sharpFrac = 1 - blurry.length / processed.length;
    add('Fotos', 'nitidez', 'Fotos nítidas', 100 * sharpFrac, '%', sharpFrac, blurry.length ? `Borrosas: ${blurry.map(p => p.name).slice(0, 6).join(', ')}` : 'Sin fotos borrosas');
    if (blurry.length) M.recs.push(`Repita o elimine las fotos borrosas (${blurry.map(p => p.name).slice(0, 6).join(', ')}). Use trípode o más luz y enfoque fijo.`);
    const clip = processed.filter(p => p.expo && (p.expo.clipHigh > 0.02 || p.expo.clipLow > 0.05));
    if (clip.length) M.recs.push(`${clip.length} foto(s) con zonas saturadas o muy oscuras: use luz difusa y evite reflejos directos sobre la pieza.`);
  }
  // ---------- Calibración ----------
  if (cal) {
    add('Calibración', 'rms', 'Error de reproyección (RMS)', cal.rms, 'px', score(cal.rms, 0.3, 2.0), `${cal.nPoints} esquinas usadas`);
    add('Calibración', 'focal', 'Distancia focal', cal.K.fx, 'px', null, cal.std && cal.std.f ? `± ${cal.std.f.toFixed(2)} px (1σ)` : '');
    add('Calibración', 'cobertura_img', 'Cobertura de la imagen por el tapete', 100 * cal.coverage.frac, '%', score(cal.coverage.frac, 0.85, 0.35), 'Necesaria para estimar la distorsión de la lente');
    if (cal.coverage.frac < 0.6) M.recs.push('Incluya fotos donde los marcadores aparezcan cerca de las esquinas de la imagen (mejora la corrección de distorsión).');
    if (cal.rms > 1.0) M.recs.push('El error de reproyección es alto: verifique que el tapete esté plano, que no cambió el zoom/enfoque entre fotos y que no hay movimiento.');
    if (cal.check && cal.check.rms3d !== undefined) {
      const c = cal.check;
      add('Calibración', 'control', 'Exactitud en puntos de control (RMS 3D)', c.rms3d, 'mm', score(c.rms3d, 0.08 * target, 0.6 * target), `${c.n} esquinas excluidas del ajuste · máx ${c.max3d.toFixed(3)} mm`);
      if (c.scaleErrPPM !== null) add('Calibración', 'escala', 'Error de escala (mediana)', c.scaleErrPPM / 1e4, '%', score(c.scaleErrPPM, 300, 3000), 'Distancias entre puntos de control > 100 mm');
      if (c.rms3d > 0.4 * target) M.recs.push('La exactitud en puntos de control es baja: tome más fotos con mayor variación de ángulo (30°–75° de elevación) alrededor de toda la pieza.');
    }
    const net = project.networkStats();
    if (net) {
      add('Calibración', 'azimut', 'Cobertura angular alrededor de la pieza', 100 * net.azimuthCoverage, '%', score(net.azimuthCoverage, 0.9, 0.4), `Elevación ${net.elevMin.toFixed(0)}°–${net.elevMax.toFixed(0)}°`);
      if (net.azimuthCoverage < 0.75) M.recs.push('Faltan vistas en algunas direcciones: rodee la pieza completa (cada 30° aprox.).');
      if (net.elevMax - net.elevMin < 20) M.recs.push('Varíe la altura de la cámara: combine fotos bajas (~35°) y altas (~70°).');
    }
    if (cal.stickers && cal.stickers.length) {
      const sd = cal.stickers.map(s => s.std).filter(isFinite);
      add('Calibración', 'calcomanias', 'Calcomanías trianguladas sobre la pieza', cal.stickers.length, '', null, sd.length ? `Incertidumbre mediana ${median(sd).toFixed(3)} mm` : '');
    }
  }
  // ---------- Reconstrucción ----------
  if (recon) {
    for (const w of recon.warnings || []) M.recs.push(w);
    if (recon.partBox && recon.partBox.warn) M.recs.push('No se pudo aislar la pieza sobre la mesa: verifique que tenga textura (moteado) y que sobresalga de la mesa.');
    const pv = recon.perView.filter(v => !v.skipped);
    const vf = pv.length ? mean(pv.map(v => v.validFrac)) : 0;
    add('Reconstrucción', 'validez', 'Píxeles con correspondencia confiable', 100 * vf, '%', score(vf, 0.75, 0.25), `Promedio de ${pv.length} mapas de profundidad`);
    if (vf < 0.5) M.recs.push('Pocos píxeles confiables: la pieza necesita más textura. Aplique spray revelador mate y/o moteado (hoja de moteado o puntos con marcador).');
    if (recon.tableStats) {
      const ts = recon.tableStats;
      add('Reconstrucción', 'ruido', 'Ruido de profundidad (plano de la mesa, 1σ)', ts.sigma, 'mm', score(ts.sigma, 0.05 * target, 0.4 * target), `RMS ${ts.rms.toFixed(3)} mm · sesgo ${ts.bias.toFixed(3)} mm · p95 ${ts.p95.toFixed(3)} mm`);
    }
    const conf = recon.mesh.conf;
    if (conf && conf.length) {
      let n3 = 0; for (const c of conf) if (c >= 3) n3++;
      const f3 = n3 / conf.length;
      add('Reconstrucción', 'multivista', 'Superficie vista por ≥ 3 fotos', 100 * f3, '%', score(f3, 0.9, 0.4), 'Confianza de la malla');
      if (f3 < 0.7) M.recs.push('Parte de la superficie se vio en pocas fotos: agregue fotos que cubran las caras laterales y la pestaña desde ambos lados.');
    }
    if (recon.coverage) {
      add('Reconstrucción', 'cobertura', 'Cobertura estimada de la pieza', 100 * recon.coverage.frac, '%', score(recon.coverage.frac, 0.95, 0.6), 'Vóxeles de la localización inicial cubiertos por la malla final');
      if (recon.coverage.frac < 0.85) M.recs.push('Faltan zonas de la pieza en la malla (p. ej. paredes verticales o pestañas): agregue fotos más bajas (30–40°) dirigidas a esas caras y asegure que tengan textura.');
    }
    const st = recon.meshStats;
    if (st) {
      add('Pieza', 'dim', 'Dimensiones (caja envolvente X × Y × Z)', `${st.bbox.size[0].toFixed(2)} × ${st.bbox.size[1].toFixed(2)} × ${st.bbox.size[2].toFixed(2)}`, 'mm');
      add('Pieza', 'area', 'Área de superficie reconstruida', st.area / 100, 'cm²');
      add('Pieza', 'tri', 'Malla', `${st.vertices.toLocaleString('es-MX')} vért. · ${st.triangles.toLocaleString('es-MX')} triáng.`, '');
      const dens = st.vertices / Math.max(1e-6, st.area / 100);
      add('Pieza', 'densidad', 'Densidad de puntos', dens, 'pts/cm²', null, `Vóxel ${recon.voxel.toFixed(2)} mm · GSD ${recon.gsd.toFixed(3)} mm/px`);
      if (st.closed) add('Pieza', 'vol', 'Volumen (malla cerrada)', st.volume / 1000, 'cm³');
      if (holes && holes.length) {
        const circ = holes.filter(o => o.type === 'circular');
        const nOpen = holes.filter(o => o.type !== 'circular' && o.section !== null).length;
        add('Pieza', 'barrenos', 'Barrenos detectados', circ.length ? circ.map(o => `Ø${o.diameter.toFixed(2)}`).join(' · ') : 'ninguno circular', '', null, `${nOpen} abertura(s) medida(s) · ${holes.length - circ.length - nOpen} abertura(s) o hueco(s) sin pared medible`);
      }
    }
  }
  // ---------- Incertidumbre estimada ----------
  const sCheck = cal && cal.check && cal.check.rms3d !== undefined ? cal.check.rms3d / Math.sqrt(3) : null;
  const sNoise = recon && recon.tableStats ? recon.tableStats.sigma : null;
  if (sCheck !== null || sNoise !== null) {
    const s = Math.sqrt((sCheck || 0) ** 2 + (sNoise || 0) ** 2 + (recon ? (0.25 * recon.voxel) ** 2 : 0));
    M.uncertainty95 = 2 * s;
    add('Resumen', 'u95', 'Incertidumbre estimada (95 %, k = 2)', M.uncertainty95, 'mm', score(M.uncertainty95, 0.25 * target, 1.5 * target), 'Combina control 3D, ruido de superficie y resolución');
  }
  // ---------- CAD ----------
  if (cad && cad.stats) {
    const c = cad.stats;
    add('Comparación CAD', 'cad_tol', `Puntos dentro de tolerancia (±${cad.tol} mm)`, 100 * c.inTol, '%', c.inTol, `Media ${c.mean.toFixed(3)} mm · RMS ${c.rms.toFixed(3)} mm`);
    add('Comparación CAD', 'cad_max', 'Desviación máxima (+ / −)', `${c.max.toFixed(3)} / ${c.min.toFixed(3)}`, 'mm');
    add('Comparación CAD', 'cad_cov', 'Cobertura del CAD por la medición', 100 * c.coverage, '%', score(c.coverage, 0.85, 0.3));
  }
  // ---------- Índice global ----------
  const W = { registro: 1.2, rms: 1, control: 1.6, ruido: 1.4, multivista: 1.0, cobertura: 1.4, validez: 1, nitidez: 0.6, cobertura_img: 0.6, azimut: 0.8, cad_tol: 1.6, cad_cov: 1.2 };
  let sw = 0, ss = 0;
  for (const [k, w] of Object.entries(W)) if (M.scores[k] !== undefined && M.scores[k] !== null) { sw += w; ss += w * M.scores[k]; }
  M.index = sw ? ss / sw : null;
  // los indicadores de exactitud son críticos: si uno falla, el índice no puede ser alto
  const crit = ['control', 'ruido', 'rms'].map(k => M.scores[k]).filter(v => v !== undefined && v !== null);
  if (M.index !== null && crit.length) M.index = Math.min(M.index, Math.min(...crit) + 0.35);
  if (M.index !== null) {
    const q = M.index;
    M.verdict = q >= 0.85 ? 'Excelente' : q >= 0.7 ? 'Buena' : q >= 0.5 ? 'Aceptable con reservas' : 'Insuficiente';
    M.verdictClass = q >= 0.7 ? 'ok' : q >= 0.5 ? 'warn' : 'bad';
  }
  if (M.uncertainty95 !== undefined) {
    M.meetsTarget = M.uncertainty95 <= target;
    M.summary = M.meetsTarget
      ? `Cumple precisión de ±${target} mm (incertidumbre estimada ±${M.uncertainty95.toFixed(2)} mm, 95 %).`
      : `No alcanza ±${target} mm: incertidumbre estimada ±${M.uncertainty95.toFixed(2)} mm (95 %).`;
  }
  if (!M.recs.length && M.index !== null) M.recs.push('La captura y la reconstrucción tienen buena calidad. Para piezas críticas, agregue calcomanías de control sobre la pieza y compare con el CAD.');
  return M;
}

export function metricsToCSV(M) {
  const rows = [['grupo', 'métrica', 'valor', 'unidad', 'puntuación (%)', 'nota']];
  for (const it of M.items) rows.push([it.group, it.label, typeof it.value === 'number' ? it.value.toFixed(4) : it.value, it.unit, it.score === null || it.score === undefined ? '' : (100 * it.score).toFixed(1), it.note]);
  if (M.index !== null && M.index !== undefined) rows.push(['Resumen', 'Índice global de calidad', (100 * M.index).toFixed(1), '%', '', M.verdict]);
  return rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}
