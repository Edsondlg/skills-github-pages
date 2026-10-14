// Utilidades de cámara para three.js (convención OpenCV -> OpenGL).
import * as THREE from 'three';

// Matriz de proyección de three.js equivalente a una K (estenopeica) para una imagen W x H.
export function projectionFromK(K, W, H, near = 10, far = 5000) {
  const m = new THREE.Matrix4();
  const P02 = 1 - 2 * (K.cx + 0.5) / W;
  const P12 = 2 * (K.cy + 0.5) / H - 1;
  m.set(
    2 * K.fx / W, 0, P02, 0,
    0, 2 * K.fy / H, P12, 0,
    0, 0, -(far + near) / (far - near), -2 * far * near / (far - near),
    0, 0, -1, 0,
  );
  return m;
}

// Coloca una cámara de three.js con la pose (convención OpenCV: Xc = R Xw + t).
export function setThreeCameraPose(cam, R, t) {
  const C = [-(R[0] * t[0] + R[3] * t[1] + R[6] * t[2]), -(R[1] * t[0] + R[4] * t[1] + R[7] * t[2]), -(R[2] * t[0] + R[5] * t[1] + R[8] * t[2])];
  // columnas de la rotación cámara->mundo en convención OpenGL: x = R^T e1, y = -R^T e2, z = -R^T e3
  const m = new THREE.Matrix4().set(
    R[0], -R[3], -R[6], C[0],
    R[1], -R[4], -R[7], C[1],
    R[2], -R[5], -R[8], C[2],
    0, 0, 0, 1,
  );
  cam.matrixAutoUpdate = false;
  cam.matrix.copy(m);
  cam.matrixWorld.copy(m);
  cam.matrixWorldInverse.copy(m).invert();
}

