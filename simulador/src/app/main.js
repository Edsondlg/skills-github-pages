// Punto de entrada provisional: inicializa el armazón con datos de demostración.
// El integrador lo sustituye por el cableado real (kernel, visores, importadores).
import { initShell } from './ui-shell.js';
import { runShellDemo } from './shell-demo.js';

document.addEventListener('DOMContentLoaded', () => {
  initShell();
  runShellDemo();
});
