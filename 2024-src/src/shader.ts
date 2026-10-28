// HTML setup
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("WebGL2 is not supported.");
}

// Adjust canvas size for device DPI
function resizeCanvasToDisplaySize(canvas) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = Math.floor(canvas.clientWidth * devicePixelRatio);
    const height = Math.floor(canvas.clientHeight * devicePixelRatio);

    console.log(document.body.clientWidth);
    
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
}
resizeCanvasToDisplaySize(canvas);

// Vertex Shader Code
const vertexShaderSource = `#version 300 es
    in vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

// Fragment Shader Code
const fragmentShaderSource = `#version 300 es
    precision highp float;

    out vec4 outColor;

    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform float u_radius;
    uniform float u_borderWidth;
    uniform vec4 u_circleColor;
    uniform vec4 u_borderColor;
    uniform vec2 u_mouse;
    uniform float u_mouseRadius;

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;


        // Mouse interaction
        vec2 centerMouse = u_mouse * u_resolution;
        float distMouse = length(fragCoord - centerMouse);
        float edgeMouse = smoothstep(u_mouseRadius - u_borderWidth, u_mouseRadius + u_borderWidth, distMouse);
        vec4 colorMouse = mix(u_borderColor, u_circleColor, smoothstep(u_mouseRadius - u_borderWidth, u_mouseRadius, distMouse));
        vec4 outMouse = mix(colorMouse, vec4(0, 0, 0, 0), edgeMouse);


        // distortion circle
        vec2 center = u_center * u_resolution;

        // Calculate the distance from the fragment to the center of the circle
        float dist = length(fragCoord - center);

        // Distortion based on mouse proximity
        float mouseDist = length(fragCoord - u_mouse * u_resolution);
        float distortionFactor = 1.0 + 0.5 * exp(-mouseDist / 50.0);  // Adjust the divisor for stronger or weaker distortion

        // Apply distortion to the distance
        dist *= distortionFactor;

        // Smooth border with anti-aliasing
        float edge = smoothstep(u_radius - u_borderWidth, u_radius + u_borderWidth, dist);

        // Border and inside color
        vec4 color = mix(u_borderColor, u_circleColor, smoothstep(u_radius - u_borderWidth, u_radius, dist));

        color = mix(color, vec4(0, 0, 0, 0), edge);
        color = mix(color, vec4(0, 0, 0, 0), 1.0 - colorMouse);

        outColor = mix(outMouse, vec4(1, 1, 1, 1), color);
    }
`;

// Shader compilation and program setup
function compileShader(gl, source, type) {
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

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}

// Use the program
gl.useProgram(program);

// Set up geometry (a full-screen quad)
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, -1,
    1, 1,
    -1, 1
]), gl.STATIC_DRAW);

const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

// Set up uniforms
const u_resolution = gl.getUniformLocation(program, "u_resolution");
const u_center = gl.getUniformLocation(program, "u_center");
const u_radius = gl.getUniformLocation(program, "u_radius");
const u_borderWidth = gl.getUniformLocation(program, "u_borderWidth");
const u_circleColor = gl.getUniformLocation(program, "u_circleColor");
const u_borderColor = gl.getUniformLocation(program, "u_borderColor");
const u_mouse = gl.getUniformLocation(program, "u_mouse");
const u_mouseRadius = gl.getUniformLocation(program, "u_mouseRadius");

// Configure WebGL viewport and set resolution uniform
gl.viewport(0, 0, canvas.width, canvas.height);
gl.uniform2f(u_resolution, canvas.width, canvas.height);

// Set circle properties
const devicePixelRatio = window.devicePixelRatio || 1;
const borderWidth = 1.0 * devicePixelRatio;  // Scale border width to device pixels

gl.uniform2f(u_center, 0.5, 0.5);                   // Circle center at 50% of canvas width and height
gl.uniform1f(u_radius, 180.0 * devicePixelRatio);    // Circle radius in device pixels
gl.uniform1f(u_mouseRadius, 33.0 * devicePixelRatio);    // Circle radius in device pixels
gl.uniform1f(u_borderWidth, borderWidth);            // Border width in device pixels (1px at normal DPI)
gl.uniform4f(u_circleColor, 1.0, 1.0, 1.0, 1.0);     // Circle color with transparency
gl.uniform4f(u_borderColor, 0.0, 0.0, 0.0, 0.0);     // Border color

// Enable blending for transparency
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// Mouse position tracking
window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / rect.width;
    const mouseY = 1.0 - (event.clientY - rect.top) / rect.height; // Flip Y axis for WebGL
    gl.uniform2f(u_mouse, mouseX, mouseY);
    render();
});

// Render function
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

render(); // Initial render

window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize(canvas)
    gl.uniform2f(u_resolution, canvas.width, canvas.height);
    render();
});