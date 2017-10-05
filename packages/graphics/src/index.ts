//TODO: Make this a separate file.
const vertexShaderSource = `#version 300 es
  in vec4 a_position;
  
  void main () {
    gl_Position = a_position;
  }
`

//TODO: Make this a separate file.
const fragmentShaderSource = `#version 300 es
  precision mediump float;
  
  out vec4 outColor;

  void main () {
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

function initShaderProgram (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string)
  : WebGLProgram
{
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  const shaderProgram = gl.createProgram()
  if (!shaderProgram) {
    throw new Error(`Failed to create WebGL2Program`)
  }
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(`
      Unable to initialize the shader program:
        ${gl.getProgramInfoLog(shaderProgram)}
      `)
  }
  return shaderProgram
}

function loadShader(
  gl: WebGL2RenderingContext,
  type: WebGL2RenderingContext["VERTEX_SHADER"] | WebGL2RenderingContext["FRAGMENT_SHADER"],
  source: string)
  : WebGLShader
{
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error(`Failed to create WebGL2Shader`)
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader);
    throw new Error(`An error occurred compiling the shaders: ${message}`);
  }
  return shader
}

export default class Graphics {
  private gl : WebGL2RenderingContext
  constructor (target : HTMLElement) {
    const canvas = document.createElement(`canvas`) as HTMLCanvasElement
    const gl = canvas.getContext(`webgl2`)
    if (!gl) {
      throw new Error(`Failed to get "webgl2" rendering context from browser.`)
    }
    this.gl = gl
    target.appendChild(canvas)
  }
  //TODO: Create color interface
  clear () {
    this.gl.clearColor(0, 0, 0, 1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
  //TODO: Break this out into a triangle function
  test () {
    const program = initShaderProgram(this.gl, vertexShaderSource, fragmentShaderSource)
    const aPosition = this.gl.getAttribLocation(program, "a_position")
    const positionBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
       -0.5, 0.5,
       0.5, 0,
       -0.5, -0.5
    ]
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
    this.gl.vertexAttribPointer(
      aPosition,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.enableVertexAttribArray(aPosition)
    this.gl.useProgram(program)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}