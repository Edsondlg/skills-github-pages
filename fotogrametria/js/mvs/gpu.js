// Utilidades mínimas de WebGL2 para cómputo en GPU (pasadas de pantalla completa).

export class GPU {
  constructor(canvas) {
    this.canvas = canvas || (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(4, 4) : document.createElement('canvas'));
    const gl = this.canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('Este navegador no soporta WebGL2. Use Chrome, Edge, Firefox o Safari recientes.');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('La GPU no soporta texturas flotantes renderizables (EXT_color_buffer_float).');
    this.floatLinear = !!gl.getExtension('OES_texture_float_linear');
    this.gl = gl;
    this.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.maxLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
    const vs = `#version 300 es
      in vec2 aPos;
      void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;
    this.vsSrc = vs;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.buf = buf;
    this.programs = [];
    this.fbo = gl.createFramebuffer();
  }

  program(fsSrc) {
    const gl = this.gl;
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        const lines = src.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n');
        throw new Error('Error de shader: ' + log + '\n' + lines.slice(0, 4000));
      }
      return sh;
    };
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, this.vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Error de enlace: ' + gl.getProgramInfoLog(p));
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      const name = info.name.replace(/\[0\]$/, '');
      uniforms[name] = { loc: gl.getUniformLocation(p, info.name), type: info.type, size: info.size };
    }
    const prog = { p, uniforms };
    this.programs.push(prog);
    return prog;
  }

  texture2D(w, h, { internal = 'RGBA8', data = null, filter = 'nearest', mip = false, source = null } = {}) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    const [ifmt, fmt, type] = this.formats(internal);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, fmt, type, source);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, data);
    }
    const f = filter === 'linear' ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    t.w = w; t.h = h; t.internal = internal;
    return t;
  }

  textureArray(w, h, layers, { internal = 'R8', filter = 'linear' } = {}) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
    const [ifmt] = this.formats(internal);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, ifmt, w, h, layers);
    const f = filter === 'linear' ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    t.w = w; t.h = h; t.layers = layers; t.internal = internal; t.isArray = true;
    return t;
  }

  formats(internal) {
    const gl = this.gl;
    switch (internal) {
      case 'RGBA8': return [gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE];
      case 'R8': return [gl.R8, gl.RED, gl.UNSIGNED_BYTE];
      case 'R16F': return [gl.R16F, gl.RED, gl.HALF_FLOAT];
      case 'R32F': return [gl.R32F, gl.RED, gl.FLOAT];
      case 'RG32F': return [gl.RG32F, gl.RG, gl.FLOAT];
      case 'RGBA16F': return [gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT];
      case 'RGBA32F': return [gl.RGBA32F, gl.RGBA, gl.FLOAT];
      default: throw new Error('Formato desconocido ' + internal);
    }
  }

  // Ejecuta una pasada. targets: [{tex, layer?}] (MRT). uniforms: {nombre: valor}. textures: {nombre: tex}
  run(prog, targets, w, h, uniforms = {}, textures = {}) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    const bufs = [];
    targets.forEach((tg, i) => {
      const t = tg.tex || tg;
      if (t.isArray) gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, t, 0, tg.layer || 0);
      else gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0);
      bufs.push(gl.COLOR_ATTACHMENT0 + i);
    });
    for (let i = targets.length; i < 4; i++) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, null, 0);
    gl.drawBuffers(bufs);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog.p);
    let unit = 0;
    for (const [name, tex] of Object.entries(textures)) {
      const u = prog.uniforms[name];
      if (!u) continue;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(tex.isArray ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D, tex);
      gl.uniform1i(u.loc, unit);
      unit++;
    }
    for (const [name, val] of Object.entries(uniforms)) this.setUniform(prog, name, val);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  setUniform(prog, name, val) {
    const gl = this.gl;
    const u = prog.uniforms[name];
    if (!u) return;
    const v = typeof val === 'number' ? [val] : val;
    switch (u.type) {
      case gl.FLOAT: gl.uniform1fv(u.loc, v); break;
      case gl.FLOAT_VEC2: gl.uniform2fv(u.loc, v); break;
      case gl.FLOAT_VEC3: gl.uniform3fv(u.loc, v); break;
      case gl.FLOAT_VEC4: gl.uniform4fv(u.loc, v); break;
      case gl.INT: case gl.BOOL: gl.uniform1iv(u.loc, v); break;
      case gl.INT_VEC2: gl.uniform2iv(u.loc, v); break;
      case gl.FLOAT_MAT3: gl.uniformMatrix3fv(u.loc, false, v); break;
      case gl.FLOAT_MAT4: gl.uniformMatrix4fv(u.loc, false, v); break;
      default: throw new Error('Tipo de uniforme no soportado: ' + name);
    }
  }

  // Lectura de un adjunto de color del FBO (tras configurarlo con la textura).
  read(tex, { layer = 0, w = tex.w, h = tex.h, x = 0, y = 0 } = {}) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    if (tex.isArray) gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex, 0, layer);
    else gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    for (let i = 1; i < 4; i++) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, null, 0);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    const internal = tex.internal;
    let out;
    if (internal === 'RGBA8' || internal === 'R8') {
      out = new Uint8Array(w * h * 4);
      gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, out);
    } else {
      out = new Float32Array(w * h * 4);
      gl.readPixels(x, y, w, h, gl.RGBA, gl.FLOAT, out);
    }
    return out;
  }

  // Espera a que la GPU termine (sin bloquear el hilo principal más de lo necesario).
  async finish() {
    const gl = this.gl;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    await new Promise((resolve) => {
      const check = () => {
        const st = gl.clientWaitSync(sync, 0, 0);
        if (st === gl.TIMEOUT_EXPIRED) setTimeout(check, 1);
        else resolve();
      };
      check();
    });
    gl.deleteSync(sync);
  }

  deleteTexture(t) { if (t) this.gl.deleteTexture(t); }

  dispose() {
    const gl = this.gl;
    for (const p of this.programs) gl.deleteProgram(p.p);
    gl.deleteFramebuffer(this.fbo);
    gl.deleteBuffer(this.buf);
    gl.deleteVertexArray(this.vao);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }
}
