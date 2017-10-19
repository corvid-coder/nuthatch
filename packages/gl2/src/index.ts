export interface Program {
  program: WebGLProgram,
  buffers: {[index: string]: WebGLBuffer},
  attributes: {[index: string]: number},
  uniforms: {[index: string]: WebGLUniformLocation},
}

export function getContext(
  canvas: HTMLCanvasElement
) : WebGL2RenderingContext
{
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
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    return gl as WebGL2RenderingContext
}

export function initShaderProgram (
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

export function loadShader(
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

export function getAttributeLocation (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  label: string
) : number
{
  const location = gl.getAttribLocation(program, label)
  if (location === null) {
    throw new Error(`Failed to get attribute location of ${label}`)
  }
  return location
}

export function createBuffer (
  gl: WebGL2RenderingContext
) : WebGLBuffer
{
  const buffer = gl.createBuffer()
  if (buffer === null) {
    throw new Error(`Failed to create buffer`)
  }
  return buffer
}

export function getUniformLocation(
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
