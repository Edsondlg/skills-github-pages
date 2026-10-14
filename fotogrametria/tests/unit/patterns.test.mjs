import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBoard, boardPrimitives, stickerSheet, speckleSheet, parseBoardCode, boardCode, markerBits } from '../../js/core/board.js';
import { makePDF } from '../../js/core/pdf.js';
import { DICT_5X5_250 } from '../../js/core/aruco-dict.js';

test('el código del tapete reproduce la misma geometría', () => {
  const b = makeBoard({ paper: 'A4', markerSize: 25, gap: 6.25 });
  const o = parseBoardCode(b.code);
  const b2 = makeBoard(o);
  assert.equal(boardCode(o), b.code);
  assert.deepEqual(b2.markers.map(m => m.corners), b.markers.map(m => m.corners));
});

test('la corrección de escala multiplica las coordenadas del tapete', () => {
  const a = makeBoard({ paper: 'A3' }), b = makeBoard({ paper: 'A3', scaleX: 1.002, scaleY: 0.998 });
  const ca = a.markers[0].corners[0], cb = b.markers[0].corners[0];
  assert.ok(Math.abs(cb[0] - ca[0] * 1.002) < 1e-9 && Math.abs(cb[1] - ca[1] * 0.998) < 1e-9);
});

test('bits del marcador 0 coinciden con OpenCV (DICT_5X5_250)', () => {
  assert.equal(markerBits(0).join(''), '1010001011011001010111100');
  assert.equal(DICT_5X5_250.codes.length, 250);
});

test('PDF vectorial válido con tamaño de página exacto', async () => {
  const b = makeBoard({ paper: 'A3' });
  const st = stickerSheet({ size: 12, count: 10 });
  const sp = speckleSheet({});
  const blob = await makePDF([
    { prims: boardPrimitives(b), W: b.paperW, H: b.paperH },
    { prims: st.prims, W: st.paperW, H: st.paperH },
    { prims: sp.prims, W: sp.paperW, H: sp.paperH },
  ]);
  const txt = Buffer.from(await blob.arrayBuffer()).toString('latin1');
  assert.ok(txt.startsWith('%PDF-1.4'));
  assert.ok(txt.trimEnd().endsWith('%%EOF'));
  const boxes = [...txt.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)].map(m => [+m[1] * 25.4 / 72, +m[2] * 25.4 / 72]);
  assert.equal(boxes.length, 3);
  assert.ok(Math.abs(boxes[0][0] - 420) < 0.01 && Math.abs(boxes[0][1] - 297) < 0.01);
  // tabla xref coherente: cada desplazamiento apunta a "n 0 obj"
  const xref = txt.lastIndexOf('\nxref\n') + 1;
  const start = +txt.slice(txt.lastIndexOf('startxref') + 9).trim().split(/\s/)[0];
  assert.equal(start, xref);
  const lines = txt.slice(xref).split('\n').slice(3);
  for (let k = 0; k < 9; k++) {
    const off = +lines[k].slice(0, 10);
    assert.ok(txt.slice(off, off + 12).startsWith(`${k + 1} 0 obj`), `objeto ${k + 1}`);
  }
});
