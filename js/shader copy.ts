const canvas = document.getElementById('glCanvas');

const windowWidth = () => window.innerWidth * window.devicePixelRatio;
const windowHeight = () => window.innerHeight * window.devicePixelRatio;

canvas.width = windowWidth();
canvas.height = windowHeight();
const gl = canvas.getContext('webgl2');

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);

let mouse = { x: 0.5, y: 0.5 };
let mouseSpeed = 0;
let lastMousePosition = { x: 0.5, y: 0.5 };


const vertexShaderSrc = `#version 300 es
in vec2 a_position;
out vec2 v_position;

void main() {
  v_position = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0, 1);
}`;

const fragmentShaderSrc = `#version 300 es
precision highp float;
in vec2 v_position;
out vec4 fragColor;

uniform float u_aspectRatio;
uniform sampler2D u_texture;
uniform float u_amount;
uniform float u_spread;
uniform float u_width;
uniform vec2 u_mouse;

void main() {
  vec2 center = u_mouse;
  
  // Adjust texture coordinates to account for aspect ratio
  vec2 aspectAdjustedTexCoords = vec2(v_position.x * u_aspectRatio, v_position.y);
  vec2 aspectAdjustedCenter = vec2(center.x * u_aspectRatio, center.y);
  
  // Calculate the distortion map with aspect ratio compensation
  float outer_map = 1.0 - smoothstep(
      u_spread - u_width,
      u_spread,
      length(aspectAdjustedTexCoords - aspectAdjustedCenter)
  );
  
  float inner_map = smoothstep(
      u_spread - u_width * 2.0,
      u_spread - u_width,
      length(aspectAdjustedTexCoords - aspectAdjustedCenter)
  );

  float map = outer_map * inner_map;
  vec2 displacement = normalize(aspectAdjustedTexCoords - aspectAdjustedCenter) * u_amount * map;
  
  fragColor = vec4(displacement.x * 20.0, displacement.y * 20.0, 0, 1.0);
  fragColor = texture(u_texture, v_position - displacement);


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
    -1, 1,
    1, 1,
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
const uAspectRatioLocation = gl.getUniformLocation(program, 'u_aspectRatio');

// Create texture with grid pattern
function createGridTexture(gl) {
    // Create a 2x2 pixel texture that represents one square cell (white line with black background)
    const cellSize = 2; // 2x2 texture for a basic grid cell
    const data = new Uint8Array([
        255, 255, 255, 255,  // White pixel (border)
        0, 0, 0, 255,        // Black pixel (background)
        0, 0, 0, 255,        // Black pixel (background)
        255, 255, 255, 255,  // White pixel (border)
    ]);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cellSize, cellSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    return texture;
}

let gridTexture = createGridTexture(gl);
gl.uniform1i(uTextureLocation, 0);

// Mouse movement and speed calculation
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) * window.devicePixelRatio) / canvas.width;
    mouse.y = 1 - ((e.clientY - rect.top) * window.devicePixelRatio) / canvas.height;

    const dx = mouse.x - lastMousePosition.x;
    const dy = mouse.y - lastMousePosition.y;
    mouseSpeed = Math.sqrt(dx * dx + dy * dy) * 10;

    lastMousePosition = { ...mouse };
});

// Render loop
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uMouseLocation, mouse.x, mouse.y);
    gl.uniform1f(uAmountLocation, Math.max(0.005, mouseSpeed * 0.05));
    gl.uniform1f(uSpreadLocation, 0.3);
    gl.uniform1f(uWidthLocation, 0.15);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gridTexture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    mouseSpeed *= 0.9; // Gradual decay for smoother effect

    requestAnimationFrame(render);
}

function resizeCanvas() {
    canvas.width = windowWidth();
    canvas.height = windowHeight();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Calculate and update aspect ratio uniform
    const aspectRatio = canvas.width / canvas.height;
    gl.uniform1f(uAspectRatioLocation, aspectRatio);
    gridTexture = createGridTexture(gl);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

render();
