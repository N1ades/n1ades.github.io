const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

let mouse = { x: 0.5, y: 0.5 };
let mouseSpeed = 0;
let lastMousePosition = { x: 0.5, y: 0.5 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const vertexShaderSrc = `#version 300 es
in vec2 a_position;
out vec2 v_tex;

void main() {
  v_tex = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0, 1);
}`;

const fragmentShaderSrc = `#version 300 es
precision highp float;
in vec2 v_tex;
out vec4 color;

uniform sampler2D u_texture;
uniform float u_amount;
uniform float u_spread;
uniform float u_width;
uniform vec2 u_mouse;

void main() {
  vec2 center = u_mouse;
  float outer_map = 1.0 - smoothstep(u_spread - u_width, u_spread, length(v_tex - center));
  float inner_map = smoothstep(u_spread - u_width * 2.0, u_spread - u_width, length(v_tex - center));
  float map = outer_map * inner_map;
  vec2 displacement = normalize(v_tex - center) * u_amount * map;
  color = texture(u_texture, v_tex - displacement);
}`;

// Create shaders
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Initialize shaders and program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// Set up geometry
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1,
]), gl.STATIC_DRAW);

// Set up attributes
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Uniform locations
const uTextureLocation = gl.getUniformLocation(program, 'u_texture');
const uAmountLocation = gl.getUniformLocation(program, 'u_amount');
const uSpreadLocation = gl.getUniformLocation(program, 'u_spread');
const uWidthLocation = gl.getUniformLocation(program, 'u_width');
const uMouseLocation = gl.getUniformLocation(program, 'u_mouse');

// Create texture with grid pattern
function createGridTexture(gl) {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      const color = ((x % 32 === 0) || (y % 32 === 0)) ? 255 : 0;
      data.set([color, color, color, 255], offset);
    }
  }
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

const gridTexture = createGridTexture(gl);
gl.uniform1i(uTextureLocation, 0);

// Mouse movement and speed calculation
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) / canvas.width;
  mouse.y = 1 - (e.clientY - rect.top) / canvas.height;

  const dx = mouse.x - lastMousePosition.x;
  const dy = mouse.y - lastMousePosition.y;
  mouseSpeed = Math.sqrt(dx * dx + dy * dy) * 10;

  lastMousePosition = { ...mouse };
});

// Render loop
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform2f(uMouseLocation, mouse.x, mouse.y);
  gl.uniform1f(uAmountLocation, mouseSpeed * 0.05);
  gl.uniform1f(uSpreadLocation, 0.3);
  gl.uniform1f(uWidthLocation, 0.15);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gridTexture);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  mouseSpeed *= 0.9; // Gradual decay for smoother effect

  requestAnimationFrame(render);
}

render();
