// HTML setup
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("WebGL2 is not supported.");
}

// Adjust canvas size for device DPI
const resizeCanvasToDisplaySize = (canvas) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = Math.floor(canvas.clientWidth * devicePixelRatio);
    const height = Math.floor(canvas.clientHeight * devicePixelRatio);
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

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        
        vec2 center = u_center * u_resolution;
        
        // Calculate the distance from the fragment to the center of the circle
        float dist = length(fragCoord - center);
        
        // Smooth border with anti-aliasing
        float edge = smoothstep(u_radius - u_borderWidth, u_radius + u_borderWidth, dist);
        
        // Border and inside color
        vec4 color = mix(u_borderColor, u_circleColor, smoothstep(u_radius - u_borderWidth, u_radius, dist));
        
        // Set the color and transparency based on distance
        outColor = mix(color, vec4(0, 0, 0, 0), edge);
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

const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Set up uniforms
const u_resolution = gl.getUniformLocation(program, "u_resolution");
const u_center = gl.getUniformLocation(program, "u_center");
const u_radius = gl.getUniformLocation(program, "u_radius");
const u_borderWidth = gl.getUniformLocation(program, "u_borderWidth");
const u_circleColor = gl.getUniformLocation(program, "u_circleColor");
const u_borderColor = gl.getUniformLocation(program, "u_borderColor");

// Configure WebGL viewport and set resolution uniform
gl.viewport(0, 0, canvas.width, canvas.height);
const devicePixelRatio = window.devicePixelRatio || 1;
const borderWidth = 1.0 * devicePixelRatio;  // Scale border width to device pixels

// Enable blending for transparency
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const draw = () => {
    gl.uniform2f(u_resolution, canvas.width, canvas.height);
    gl.uniform2f(u_center, 0.5, 0.5);                   // Circle center at 50% of canvas width and height
    gl.uniform1f(u_radius, 100.0 * devicePixelRatio);    // Circle radius in device pixels
    gl.uniform1f(u_borderWidth, borderWidth);            // Border width in device pixels (1px at normal DPI)
    gl.uniform4f(u_circleColor, 1.0, 1.0, 1.0, 1.0);     // Circle color with transparency
    gl.uniform4f(u_borderColor, 0.0, 0.0, 0.0, 0.0);     // Border color
    // Draw the circle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
draw();
window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize(canvas)
    draw();
});