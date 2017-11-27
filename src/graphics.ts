import { Vector2, Color } from "./vector.js"
import { getFile } from "./utilities.js"
import Matrix, { mat4x4 } from "./matrix.js"
import {
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
  private program: WebGLProgram
  private buffers: {[index: string]: WebGLBuffer}
  private attributes: {[index: string]: number}
  private uniforms: {[index: string]: WebGLUniformLocation}
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
    this.program = initShaderProgram(
      this.gl,
      await getFile(`${pathToNuthatch}/assets/shader.v.glsl`),
      await getFile(`${pathToNuthatch}/assets/shader.f.glsl`),
    )
    this.gl.useProgram(this.program)
    this.buffers = {
      vbo: createBuffer(this.gl),
      ebo: createBuffer(this.gl),
      imageEbo: createBuffer(this.gl), 
    }
    const elements = new Uint16Array([ 0, 1, 2, 1, 3, 2 ])
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.imageEbo)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, elements, this.gl.STATIC_DRAW)
    this.attributes = {
      a_position: getAttributeLocation(this.gl, this.program, "a_position"),
      a_texCoord: getAttributeLocation(this.gl, this.program, "a_texCoord"),
    }
    this.uniforms = {
      u_type: getUniformLocation(this.gl, this.program, "u_type"),
      u_color: getUniformLocation(this.gl, this.program, "u_color"),
      u_tex: getUniformLocation(this.gl, this.program, "u_tex"),
      u_transformation: getUniformLocation(this.gl, this.program, "u_transformation"),
    }
    this.setTransformMatrix(Matrix.identity())
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
    this.gl.uniform4f(this.uniforms.u_color, color.r, color.g, color.b, color.a)
  }
  setTransformMatrix(
    m: mat4x4,
  )
  {
    this.gl.uniformMatrix4fv(this.uniforms.u_transformation, true, m)
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
      this.gl.uniform1i(this.uniforms.u_tex, 0)
      this.gl.activeTexture(this.gl.TEXTURE0)
    }
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                  this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
    this.lastTextureUsed = image
  }
  private drawImage (
    vertices: Float32Array
  )
  {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)
    this.gl.enableVertexAttribArray(this.attributes.a_position)
    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0 * Float32Array.BYTES_PER_ELEMENT
    )
    this.gl.enableVertexAttribArray(this.attributes.a_texCoord)
    this.gl.vertexAttribPointer(
      this.attributes.a_texCoord,
      2,
      this.gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    )
    this.gl.uniform1i(this.uniforms.u_type, 1)
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.imageEbo)
    this.gl.drawElements(
      this.gl.TRIANGLES,
      6,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
  image (
    image: HTMLImageElement
  )
  {
    this.setTexture(image)
    const x = image.naturalWidth
    const y = image.naturalHeight
    const vertices = new Float32Array([
       0, y,  0, 0,
       x, y,  1, 0,
       0, 0,  0, 1,
       x, 0,  1, 1,
    ])
    this.drawImage(vertices)
  }
  sprite (
    image: HTMLImageElement,
    position: Vector2,
    size: Vector2,
  )
  {
    this.setTexture(image)
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
    this.drawImage(vertices)
  }
  spriteBatch (
    image: HTMLImageElement,
    position: Vector2,
    size: Vector2,
    positions: Vector2[],
  )
  {
    this.setTexture(image)
    const ss: Vector2 = {x: image.naturalWidth, y: image.naturalHeight}
    const { x, y } = size
    const tcl: Vector2 = {x: position.x / ss.x, y: position.y / ss.y}
    const tch: Vector2 = {x: tcl.x + (size.x / ss.x), y: tcl.y + (size.y / ss.y)}
    const vertices = positions.map(v => {
        const {x: vx, y: vy} = v
        return [
           0+vx, y+vy,  tcl.x+vx, tcl.y+vy,
           x+vx, y+vy,  tch.x+vx, tcl.y+vy,
           0+vx, 0+vy,  tcl.x+vx, tch.y+vy,
           x+vx, 0+vy,  tch.x+vx, tch.y+vy,
        ]
      })
      .reduce((as, a)=>as.concat(a), [])
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, Float32Array.from(vertices), this.gl.STATIC_DRAW)
    this.gl.enableVertexAttribArray(this.attributes.a_position)
    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0 * Float32Array.BYTES_PER_ELEMENT
    )
    this.gl.enableVertexAttribArray(this.attributes.a_texCoord)
    this.gl.vertexAttribPointer(
      this.attributes.a_texCoord,
      2,
      this.gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    )
    this.gl.uniform1i(this.uniforms.u_type, 1)
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.ebo)
    const elements = positions.map((_,i) => {
        const o = i*4
        return [0+o, 1+o, 2+o, 1+o, 3+o, 2+o]
      })
      .reduce((as, a)=>as.concat(a), [])
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements), this.gl.STATIC_DRAW)
    this.gl.drawElements(
      this.gl.TRIANGLES,
      elements.length,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
  private triangles (
    vertices: Vector2[],
    elements: number[],
  )
  {
    const positions = vertices.reduce((vs, v) => {
      vs.push(v.x, v.y)
      return vs
    }, [] as number[])
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.ebo)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), this.gl.STATIC_DRAW)
    this.gl.enableVertexAttribArray(this.attributes.a_position)
    this.gl.uniform1i(this.uniforms.u_type, 0)
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