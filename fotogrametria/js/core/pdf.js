// Escritor PDF vectorial mínimo (tamaño real en mm) para imprimir patrones con escala exacta.
// pages: [{ prims: {rects, circles, lines, texts}, W, H, speckleColor }]

const K = 72 / 25.4; // puntos PDF por mm
const WINANSI = { '–': 0x96, '—': 0x97, '…': 0x85, '“': 0x93, '”': 0x94, '‘': 0x91, '’': 0x92, '•': 0x95, '€': 0x80 };

function pdfText(s) {
  let out = '';
  for (const ch of String(s)) {
    let c = ch.charCodeAt(0);
    if (WINANSI[ch]) c = WINANSI[ch];
    else if (c > 255) c = 63; // '?'
    if (ch === '(' || ch === ')' || ch === '\\') out += '\\' + ch;
    else if (c < 32 || c > 126) out += '\\' + c.toString(8).padStart(3, '0');
    else out += String.fromCharCode(c);
  }
  return out;
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '#000000');
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

const f = (v) => (Math.round(v * 10000) / 10000).toString();

export function pageContent({ prims, H, speckleColor = '#000000' }) {
  const out = [];
  out.push(`q ${f(K)} 0 0 ${f(-K)} 0 ${f(H * K)} cm`);
  out.push('0 0 0 rg');
  // un solo relleno para todas las celdas (sin costuras entre rectángulos contiguos)
  if (prims.rects.length) out.push(prims.rects.map(([x, y, w, h]) => `${f(x)} ${f(y)} ${f(w)} ${f(h)} re`).join('\n') + '\nf');
  if (prims.circles.length) {
    const [r, g, b] = hexToRgb(speckleColor);
    out.push(`${f(r)} ${f(g)} ${f(b)} rg`);
    const kk = 0.5522847498;
    for (const [cx, cy, rr] of prims.circles) {
      const k = kk * rr;
      out.push(`${f(cx + rr)} ${f(cy)} m ${f(cx + rr)} ${f(cy + k)} ${f(cx + k)} ${f(cy + rr)} ${f(cx)} ${f(cy + rr)} c ${f(cx - k)} ${f(cy + rr)} ${f(cx - rr)} ${f(cy + k)} ${f(cx - rr)} ${f(cy)} c ${f(cx - rr)} ${f(cy - k)} ${f(cx - k)} ${f(cy - rr)} ${f(cx)} ${f(cy - rr)} c ${f(cx + k)} ${f(cy - rr)} ${f(cx + rr)} ${f(cy - k)} ${f(cx + rr)} ${f(cy)} c f`);
    }
    out.push('0 0 0 rg');
  }
  out.push('0 0 0 RG');
  for (const [x0, y0, x1, y1, w] of prims.lines) out.push(`${f(w)} w ${f(x0)} ${f(y0)} m ${f(x1)} ${f(y1)} l S`);
  for (const t of prims.texts) {
    const [r, g, b] = hexToRgb(t.color || '#000000');
    const width = 0.53 * t.size * String(t.text).length; // aproximación de Helvetica
    let dx = 0;
    if (t.anchor === 'middle') dx = -width / 2; else if (t.anchor === 'end') dx = -width;
    const tm = t.rotate === -90 ? `0 -1 -1 0 ${f(t.x)} ${f(t.y - dx)}` : `1 0 0 -1 ${f(t.x + dx)} ${f(t.y)}`;
    out.push(`${f(r)} ${f(g)} ${f(b)} rg BT /F1 ${f(t.size)} Tf ${tm} Tm (${pdfText(t.text)}) Tj ET`);
  }
  out.push('0 0 0 rg Q');
  return out.join('\n');
}

async function deflate(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  const cs = new CompressionStream('deflate');
  const stream = new Blob([bytes]).stream().pipeThrough(cs);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function latin1(s) {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
  return b;
}

export async function makePDF(pages, { title = 'Patrones de fotogrametría' } = {}) {
  const chunks = [];
  let offset = 0;
  const offsets = [];
  const push = (b) => { chunks.push(b); offset += b.length; };
  const obj = (n, body) => { offsets[n] = offset; push(latin1(`${n} 0 obj\n`)); push(typeof body === 'string' ? latin1(body) : body); push(latin1('\nendobj\n')); };
  push(latin1('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
  const nPages = pages.length;
  // 1 catálogo, 2 páginas, 3 fuente, 4 info; luego (página, contenido) por cada hoja
  const kids = pages.map((_, i) => `${5 + 2 * i} 0 R`).join(' ');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${nPages} >>`);
  obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  obj(4, `<< /Title (${pdfText(title)}) /Producer (Fotogrametria web) >>`);
  for (let i = 0; i < nPages; i++) {
    const pg = pages[i];
    const pn = 5 + 2 * i, cn = pn + 1;
    obj(pn, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(pg.W * K)} ${f(pg.H * K)}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${cn} 0 R >>`);
    const raw = latin1(pageContent(pg));
    const comp = await deflate(raw);
    const data = comp || raw;
    offsets[cn] = offset;
    push(latin1(`${cn} 0 obj\n<< /Length ${data.length}${comp ? ' /Filter /FlateDecode' : ''} >>\nstream\n`));
    push(data);
    push(latin1('\nendstream\nendobj\n'));
  }
  const nObj = 5 + 2 * nPages;
  const xref = offset;
  let x = `xref\n0 ${nObj}\n0000000000 65535 f \n`;
  for (let i = 1; i < nObj; i++) x += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  x += `trailer\n<< /Size ${nObj} /Root 1 0 R /Info 4 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  push(latin1(x));
  return new Blob(chunks, { type: 'application/pdf' });
}
