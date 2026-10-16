// Exportación de la pieza (solo navegador): STEP/STL desde el kernel; OBJ/GLB/PLY con los
// exportadores de three.js a partir del teselado del kernel; CSV/JSON/HTML/PNG del reporte.
// Las descargas usan Blob + <a download> (funcionan en file://).
import * as THREE from 'three';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { PLYExporter } from 'three/addons/exporters/PLYExporter.js';
import { toCSV, toJSON, reportHTML } from './report.js';
import { findMaterial } from './materials.js';

// Teselado fino para archivos de malla (mm, rad).
const FINE_MESH = { tolerance: 0.005, angularTolerance: 0.05 };

/** Descarga un Blob con el nombre dado. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error || new Error('No se pudo leer la imagen.'));
    r.readAsDataURL(blob);
  });
}

// Malla three.js (mm) desde kernel.tessellate.
async function partMesh(kernel, partData, name) {
  const t = await kernel.tessellate(FINE_MESH);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(t.vertices), 3));
  if (t.normals && t.normals.length) g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(t.normals), 3));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(t.triangles), 1));
  const m = partData?.material && findMaterial(partData.material.id);
  const mat = new THREE.MeshStandardMaterial({ color: m?.color ?? '#9aa4ad', metalness: m?.metalness ?? 0.8, roughness: m?.roughness ?? 0.45 });
  mat.name = partData?.material?.name ?? 'material';
  const mesh = new THREE.Mesh(g, mat);
  mesh.name = name;
  return mesh;
}

const dispose = (mesh) => {
  mesh.geometry.dispose();
  mesh.material.dispose();
};

/**
 * Genera el archivo de exportación pedido.
 * @param {'step'|'stl'|'stl-ascii'|'obj'|'glb'|'ply'|'csv'|'json'|'report-html'|'png'} kind
 * @param {Object} o
 * @param {Object} [o.kernel]        KernelClient (step, stl, obj, glb, ply)
 * @param {Object} [o.viewer]        Viewer3D (report-html, png)
 * @param {Object} [o.partData]      datos de computePartData/computeAll (csv, json, report-html; color de malla)
 * @param {Array} [o.measurements]   [{ title, text }]
 * @param {string} [o.fileBase='pieza']  nombre base sin extensión
 * @param {string} [o.fileName]      archivo de origen que se muestra en el reporte (por defecto fileBase)
 * @param {'metric'|'imperial'} [o.system='metric']
 * @returns {Promise<{blob: Blob, filename: string}>}
 */
export async function exportPart(kind, { kernel, viewer, partData, measurements = [], fileBase = 'pieza', fileName, system = 'metric' } = {}) {
  const out = (data, type, ext) => ({ blob: data instanceof Blob ? data : new Blob([data], { type }), filename: `${fileBase}.${ext}` });
  switch (kind) {
    case 'step': {
      const r = await kernel.exportShape({ format: 'step', name: fileBase });
      return out(r.data, 'application/step', 'step');
    }
    case 'stl':
    case 'stl-ascii': {
      const r = await kernel.exportShape({ format: kind, ...FINE_MESH, name: fileBase });
      return out(r.data, 'model/stl', 'stl');
    }
    case 'obj': {
      const mesh = await partMesh(kernel, partData, fileBase);
      try {
        return out(new OBJExporter().parse(mesh), 'model/obj', 'obj');
      } finally {
        dispose(mesh);
      }
    }
    case 'glb': {
      // glTF usa metros: la malla (mm) se escala 1/1000 en un nodo con nombre.
      const mesh = await partMesh(kernel, partData, fileBase);
      mesh.scale.setScalar(0.001);
      try {
        const data = await new GLTFExporter().parseAsync(mesh, { binary: true });
        return out(data, 'model/gltf-binary', 'glb');
      } finally {
        dispose(mesh);
      }
    }
    case 'ply': {
      const mesh = await partMesh(kernel, partData, fileBase);
      try {
        const data = await new Promise((resolve) => new PLYExporter().parse(mesh, resolve, { binary: true }));
        return out(data, 'application/octet-stream', 'ply');
      } finally {
        dispose(mesh);
      }
    }
    case 'csv':
      // BOM para que Excel lea bien los acentos.
      return out('﻿' + toCSV(partData, measurements), 'text/csv;charset=utf-8', 'csv');
    case 'json':
      return out(toJSON(partData, measurements), 'application/json', 'json');
    case 'report-html': {
      const imageDataURL = viewer ? await blobToDataURL(await viewer.screenshot(2)) : '';
      const html = reportHTML(partData, { fileName: fileName ?? fileBase, imageDataURL, measurements, system });
      return { blob: new Blob([html], { type: 'text/html;charset=utf-8' }), filename: `${fileBase}-reporte.html` };
    }
    case 'png':
      return out(await viewer.screenshot(2), 'image/png', 'png');
    default:
      throw new Error(`Formato de exportación desconocido: ${kind}`);
  }
}

/**
 * Abre el reporte en una ventana nueva y lanza la impresión al terminar de cargar (funciona en file://).
 * Si el navegador bloquea la ventana emergente, descarga el HTML.
 * @param {string} html
 * @param {string} [filename='reporte.html']  nombre de la descarga de respaldo
 * @returns {boolean} true si se abrió la ventana
 */
export function openPrintableReport(html, filename = 'reporte.html') {
  const w = window.open('', '_blank');
  if (!w) {
    downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), filename);
    return false;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  let done = false;
  const print = () => {
    if (done || w.closed) return;
    done = true;
    w.focus();
    w.print();
  };
  if (w.document.readyState === 'complete') setTimeout(print, 200);
  else w.addEventListener('load', () => setTimeout(print, 100), { once: true });
  setTimeout(print, 3000); // respaldo si no llega el evento load
  return true;
}
