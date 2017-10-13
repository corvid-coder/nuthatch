import { Vector2 } from "../node_modules/@nuthatch/vector/index.js"
//TODO: Leave API functions here, move GL stuff into module or maybe package

//QUESTION: Should this just be a vector?
export interface Color {
  r: number,
  g: number,
  b: number,
  a: number,
}

interface Program {
  program: WebGLProgram,
  buffers: {[index: string]: number},
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

function getBuffer (
  gl: WebGL2RenderingContext
) : number {
  const buffer = gl.createBuffer()
  if (buffer === null) {
    throw new Error(`Failed to create buffer`)
  }
  return buffer
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
  constructor (
    target : HTMLElement
  )
  {
    const canvas = document.createElement(`canvas`) as HTMLCanvasElement
    canvas.height = canvas.width
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
    this.gl.useProgram(program)
    this.programs.triangle = {
      program: program,
      // QUESTION: Does each program need its own buffers?
      buffers: {
        elements: getBuffer(this.gl),
        position: getBuffer(this.gl),
      },
      attributes: {
        a_position: getAttributeLocation(this.gl, program, "a_position"),
      },
      uniforms: {
        u_color: getUniformLocation(this.gl, program, "u_color"),
      },
    }
  }
  clear (
    color: Color
  )
  {
    this.gl.clearColor(color.r, color.g, color.b, color.a)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
  //TODO: Handle alpha colors
  setColor (
    color: Color
  )
  {
    //QUESTION: Does this need to be here?
    this.gl.useProgram(this.programs.triangle.program)
    this.gl.uniform4f(
      this.programs.triangle.uniforms.u_color,
      color.r,
      color.g,
      color.b,
      color.a,
    )
  }
  private triangles (
    vertices: Vector2<number>[],
    elements: number[],
  )
  {
    this.gl.useProgram(this.programs.triangle.program)
    const positions = vertices.reduce((vs, v) => {
      vs.push(v.x, v.y)
      return vs
    }, [] as number[])
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programs.triangle.buffers.position)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
    this.gl.vertexAttribPointer(
      this.programs.triangle.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.triangle.buffers.elements)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), this.gl.STATIC_DRAW)
    this.gl.enableVertexAttribArray(this.programs.triangle.attributes.a_position)
    this.gl.drawElements(
      this.gl.TRIANGLES,
      elements.length,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
  circle (
    position: Vector2<number>,
    radius: number,
    segments: number = 26,
  )
  {
    const indices = []
    for (var i=1; i<segments-1; i++) {
      indices.push(0, i, i+1)
    }
    const vertices = []
    for (var i=0; i<segments; i++) {
      const theta = (360 / (segments)) * i * (Math.PI / 180)
      vertices.push({
        x: position.x + Math.cos(theta) * radius,
        y: position.y + Math.sin(theta) * radius,
      })
    }
    this.triangles(
      vertices,
      indices,
    )
  }
  polygon (
    vertices :Vector2<number>[]
  )
  {
    const indices = []
    for (var i=1; i<vertices.length-1; i++) {
      indices.push(0, i, i+1)
    }
    this.triangles(
      vertices,
      indices,
    )
  }
  rectangle (
    position: Vector2<number>,
    size: Vector2<number>,
  )
  {
    this.triangles(
      [
        {x: position.x, y: position.y + size.y},
        {x: position.x + size.x, y: position.y + size.y},
        {x: position.x, y: position.y},
        {x: position.x + size.x, y: position.y},
      ],
      [1, 2, 0, 3, 2, 1],
    )
  }
  triangle (
    v1: Vector2<number>,
    v2: Vector2<number>,
    v3: Vector2<number>,
  )
  {
    this.triangles(
      [v1, v2, v3],
      [0, 1, 2],
    )
  }
}

export default Graphics