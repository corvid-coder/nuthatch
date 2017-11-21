import { Vector2, Color } from "./vector.js"
import { getFile } from "./utilities.js"
import Matrix, { mat4x4 } from "./matrix.js"
import {
  Program,
  getContext,
  initShaderProgram,
  getAttributeLocation,
  getUniformLocation,
  createBuffer,
  createTexture,
} from "./webgl2.js"

class Graphics
{
  private gl : WebGL2RenderingContext
  private programs: { [index: string]: Program } = {}
  private program: Program
  private transformMatrix : mat4x4 = Matrix.identity()
  private color : Color = {r:1, g:1, b:1, a:1}
  private textureCache: WeakMap<HTMLImageElement, WebGLTexture> = new WeakMap()
  private lastTextureUsed: HTMLImageElement
  constructor (
    target: HTMLElement = document.body,
    size: Vector2 = {x: 300, y: 300},
    
  )
  {
    const canvas = document.createElement(`canvas`) as HTMLCanvasElement
    canvas.width = size.x
    canvas.height = size.y
    this.gl = getContext(canvas)
    target.appendChild(canvas)
  }
  async setup (
    pathToNuthatch: string = "/node_modules/@nuthatch",
  ) {
    if (pathToNuthatch.endsWith("/")) {
      pathToNuthatch = pathToNuthatch.slice(1)
    }
    let program
    program = initShaderProgram(
      this.gl,
      await getFile(`${pathToNuthatch}/assets/shape.v.glsl`),
      await getFile(`${pathToNuthatch}/assets/shape.f.glsl`),
    )
    this.programs.triangle = {
      program: program,
      buffers: {
        vbo: createBuffer(this.gl),
        ebo: createBuffer(this.gl),
      },
      attributes: {
        a_position: getAttributeLocation(this.gl, program, "a_position"),
      },
      uniforms: {
        u_color: getUniformLocation(this.gl, program, "u_color"),
        u_trans: getUniformLocation(this.gl, program, "u_trans"),
      },
    }
    program = initShaderProgram(
      this.gl,
      await getFile(`${pathToNuthatch}/assets/image.v.glsl`),
      await getFile(`${pathToNuthatch}/assets/image.f.glsl`),
    )
    this.programs.image = {
      program: program,
      buffers: {
        vbo: createBuffer(this.gl),
        ebo: createBuffer(this.gl),
      },
      attributes: {
        a_position: getAttributeLocation(this.gl, program, "a_position"),
        a_texCoord: getAttributeLocation(this.gl, program, "a_texCoord"),
      },
      uniforms: {
        u_color: getUniformLocation(this.gl, program, "u_color"),
        u_tex: getUniformLocation(this.gl, program, "u_tex"),
        u_trans: getUniformLocation(this.gl, program, "u_trans"),
      },
    }
    this.program = this.programs.triangle
    this.gl.useProgram(this.program.program)
  }
  clear (
    color: Color
  )
  {
    this.gl.clearColor(color.r, color.g, color.b, color.a)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
  setColor (
    color: Color
  )
  {
    this.color = color
  }
  setTransformMatrix(
    m: mat4x4,
  )
  {
    this.transformMatrix = m
  }
  setTexture(
    image: HTMLImageElement,
  )
  {
    if (this.lastTextureUsed === image) {
      return
    }
    let texture = this.textureCache.get(image)
    if (!texture) {
      texture = createTexture(this.gl)
      this.textureCache.set(image, texture)
    }
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.uniform1i(this.programs.image.uniforms.u_tex, 0)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                  this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
    this.lastTextureUsed = image
  }
  private drawImage ()
  {
    this.gl.enableVertexAttribArray(this.programs.image.attributes.a_position)
    this.gl.vertexAttribPointer(
      this.programs.image.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0 * Float32Array.BYTES_PER_ELEMENT
    )
    this.gl.enableVertexAttribArray(this.programs.image.attributes.a_texCoord)
    this.gl.vertexAttribPointer(
      this.programs.image.attributes.a_texCoord,
      2,
      this.gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    )
    const elements = new Uint16Array([ 0, 1, 2, 1, 3, 2 ])
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.image.buffers.ebo)
    //QUESTION: Can this be cached?
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, elements, this.gl.STATIC_DRAW)
    this.gl.drawElements(
      this.gl.TRIANGLES,
      elements.length,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
  image (
    image: HTMLImageElement
  )
  {
    this.program = this.programs.image
    this.gl.useProgram(this.programs.image.program)
    this.setTexture(image)
    this.gl.uniformMatrix4fv(this.program.uniforms.u_trans, true, this.transformMatrix)
    this.gl.uniform4f(
      this.program.uniforms.u_color,
      this.color.r,
      this.color.g,
      this.color.b,
      this.color.a,
    )
    const x = image.naturalWidth
    const y = image.naturalHeight
    const vertices = new Float32Array([
       0, y,  0, 0,
       x, y,  1, 0,
       0, 0,  0, 1,
       x, 0,  1, 1,
    ])
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programs.image.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)
    this.drawImage()
  }
  sprite (
    image: HTMLImageElement,
    position: Vector2,
    size: Vector2,
  )
  {
    this.program = this.programs.image
    this.gl.useProgram(this.programs.image.program)
    this.gl.uniformMatrix4fv(this.program.uniforms.u_trans, true, this.transformMatrix)
    this.setTexture(image)
    this.gl.uniform4f(
      this.program.uniforms.u_color,
      this.color.r,
      this.color.g,
      this.color.b,
      this.color.a,
    )
    const ss: Vector2 = {x: image.naturalWidth, y: image.naturalHeight}
    const { x, y } = size
    const tcl: Vector2 = {x: position.x / ss.x, y: position.y / ss.y}
    const tch: Vector2 = {x: tcl.x + (size.x / ss.x), y: tcl.y + (size.y / ss.y)}
    const vertices = new Float32Array([
       0, y,  tcl.x, tcl.y,
       x, y,  tch.x, tcl.y,
       0, 0,  tcl.x, tch.y,
       x, 0,  tch.x, tch.y,
    ])
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programs.image.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)
    this.drawImage()
  }
  private triangles (
    vertices: Vector2[],
    elements: number[],
  )
  {
    this.program = this.programs.triangle
    this.gl.useProgram(this.programs.triangle.program)
    this.gl.uniform4f(
      this.program.uniforms.u_color,
      this.color.r,
      this.color.g,
      this.color.b,
      this.color.a,
    )
    this.gl.uniformMatrix4fv(this.program.uniforms.u_trans, true, this.transformMatrix)
    const positions = vertices.reduce((vs, v) => {
      vs.push(v.x, v.y)
      return vs
    }, [] as number[])
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programs.triangle.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
    this.gl.vertexAttribPointer(
      this.programs.triangle.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.programs.triangle.buffers.ebo)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), this.gl.STATIC_DRAW)
    this.gl.enableVertexAttribArray(this.programs.triangle.attributes.a_position)
    this.gl.drawElements(
      this.gl.TRIANGLES,
      elements.length,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
  // Remove x/y
  circle (
    position: Vector2,
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
    vertices :Vector2[]
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
  // Remove x/y
  rectangle (
    position: Vector2,
    size: Vector2,
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
    v1: Vector2,
    v2: Vector2,
    v3: Vector2,
  )
  {
    this.triangles(
      [v1, v2, v3],
      [0, 1, 2],
    )
  }
}

export default Graphics