import { assert } from "./debug.js"
import { Option, Some } from "./utilities.js"

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
    })!
    assert(gl !== null, `Failed to get "webgl2" rendering context from browser.`)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    return gl as WebGL2RenderingContext
}

export function initShaderProgram (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) : Option<WebGLProgram>
{
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  const shaderProgram = gl.createProgram()!
  assert(shaderProgram !== null, `Failed to create WebGL2Program`)
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  assert(
    !!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS),
    `Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`
  )
  return Some(shaderProgram)
}

export function loadShader(
  gl: WebGL2RenderingContext,
  type: WebGL2RenderingContext["VERTEX_SHADER"] | WebGL2RenderingContext["FRAGMENT_SHADER"],
  source: string)
  : WebGLShader
{
  const shader = gl.createShader(type)!
  assert(shader !== null, `Failed to create WebGL2Shader`)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  assert(
    !!gl.getShaderParameter(shader, gl.COMPILE_STATUS),
    `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
  )
  return shader
}

export function getAttributeLocation (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  label: string
) : number
{
  const location = gl.getAttribLocation(program, label)!
  assert(location !== null, `Failed to get attribute location of ${label}`)
  return location
}

export function createBuffer (
  gl: WebGL2RenderingContext
) : WebGLBuffer
{
  const buffer = gl.createBuffer()!
  assert(buffer !== null, `Failed to create buffer`)
  return buffer
}

export function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  label: string
) : WebGLUniformLocation
{
  const location = gl.getUniformLocation(program, label)!
  assert(location !== null, `Failed to get uniform location of ${label}`)
  return location
}

export function createTexture(
  gl: WebGL2RenderingContext,
) : WebGLTexture
{
  const texture = gl.createTexture()!
  assert(texture !== null, `Failed to create texture`)
  return texture
}
