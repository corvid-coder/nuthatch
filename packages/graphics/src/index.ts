export interface Vector2<T> {
  x: T,
  y: T,
}

export interface Color {
  r: number,
  g: number,
  b: number,
  a: number,
}

interface Program {
  program: WebGLProgram,
  attributes: {[index: string]: number},
  uniforms: {[index: string]: WebGLUniformLocation},
}

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
  
  uniform vec4 u_color;
  out vec4 out_color;

  void main () {
    out_color = u_color;
  }
`

function initShaderProgram (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) : WebGLProgram
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

function getAttributeLocation (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  label: string
) : number {
  const location = gl.getAttribLocation(program, label)
  if (location === null) {
    throw new Error(`Failed to get attribute location of ${label}`)
  }
  return location
}

function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  label: string
) : WebGLUniformLocation
{
  const location = gl.getUniformLocation(program, label)
  if (location === null) {
    throw new Error(`Failed to get uniform location of ${label}`)
  }
  return location
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

class Graphics
{
  private gl : WebGL2RenderingContext
  private programs: { [index: string]: Program } = {}
  constructor (target : HTMLElement) {
    const canvas = document.createElement(`canvas`) as HTMLCanvasElement
    const gl = canvas.getContext(`webgl2`, {
      antialias: false,
      depth: false,
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    })
    if (!gl) {
      throw new Error(`Failed to get "webgl2" rendering context from browser.`)
    }
    this.gl = gl as WebGL2RenderingContext
    target.appendChild(canvas)
    this.setupPrograms()
  }
  setupPrograms () {
    let program = initShaderProgram(this.gl, vertexShaderSource, fragmentShaderSource)
    this.programs.triangle = {
      program: program,
      attributes: {
        a_position: getAttributeLocation(this.gl, program, "a_position"),
      },
      uniforms: {
        u_color: getUniformLocation(this.gl, program, "u_color"),
      },
    }
  }
  clear (color: Color)
  {
    this.gl.clearColor(color.r, color.g, color.b, color.a)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
  triangle (
    v1: Vector2<number>,
    v2: Vector2<number>,
    v3: Vector2<number>,
    color: Color
  )
  {
    this.gl.useProgram(this.programs.triangle.program)
    //TODO: Maybe don't create a buffer every time.
    const positionBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
    const positions =
    [
      v1.x, v1.y,
      v2.x, v2.y,
      v3.x, v3.y,
    ]
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
    this.gl.uniform4f(
      this.programs.triangle.uniforms.u_color,
      color.r,
      color.g,
      color.b,
      color.a
    )
    this.gl.vertexAttribPointer(
      this.programs.triangle.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.enableVertexAttribArray(this.programs.triangle.attributes.a_position)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}

export default Graphics