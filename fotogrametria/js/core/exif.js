// Lector EXIF mínimo para JPEG (focal, focal equivalente 35 mm, cámara, orientación).
export function readExif(buffer) {
  const v = new DataView(buffer);
  if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
  let off = 2;
  while (off + 4 < v.byteLength) {
    const marker = v.getUint16(off);
    const len = v.getUint16(off + 2);
    if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) return parseTiff(v, off + 10);
    if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA) break;
    off += 2 + len;
  }
  return null;
}

function parseTiff(v, start) {
  const le = v.getUint16(start) === 0x4949;
  const u16 = (o) => v.getUint16(start + o, le), u32 = (o) => v.getUint32(start + o, le);
  const out = {};
  const readIFD = (o, tags) => {
    if (o <= 0 || start + o + 2 > v.byteLength) return;
    const n = u16(o);
    for (let i = 0; i < n; i++) {
      const e = o + 2 + i * 12;
      if (start + e + 12 > v.byteLength) break;
      const tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
      const valOff = (type === 2 && cnt > 4) || type === 5 || type === 10 ? u32(e + 8) : e + 8;
      const name = tags[tag];
      if (!name) continue;
      try {
        if (type === 2) {
          let s = '';
          for (let k = 0; k < cnt - 1 && start + valOff + k < v.byteLength; k++) s += String.fromCharCode(v.getUint8(start + valOff + k));
          out[name] = s.trim();
        } else if (type === 3) out[name] = u16(e + 8);
        else if (type === 4) out[name] = u32(e + 8);
        else if (type === 5 || type === 10) { const a = u32(valOff), b = u32(valOff + 4); out[name] = b ? a / b : 0; }
      } catch { /* etiqueta dañada */ }
    }
  };
  const ifd0 = u32(4);
  readIFD(ifd0, { 0x010F: 'make', 0x0110: 'model', 0x0112: 'orientation', 0x8769: 'exifPtr' });
  if (out.exifPtr) readIFD(out.exifPtr, { 0x920A: 'focalMM', 0xA405: 'focal35', 0xA20E: 'focalPlaneXRes', 0xA210: 'focalPlaneUnit', 0xA002: 'pixelXDim', 0xA003: 'pixelYDim', 0x9003: 'date', 0x829A: 'exposure', 0x829D: 'fnumber', 0x8827: 'iso' });
  delete out.exifPtr;
  return out;
}
