import { readFileSync } from "fs";
import { Vector2, Color } from "./vector.js"
import { Option, OptionState, Some, None } from "./utilities.js"
import { Matrix, mat4x4 } from "./matrix.js"
import { Font } from "./font.js"
import {
  getContext,
  initShaderProgram,
  getAttributeLocation,
  getUniformLocation,
  createBuffer,
  createTexture,
} from "./webgl2.js"

export class Graphics
{
  private gl : WebGL2RenderingContext
  private program: Option<WebGLProgram> = None()
  private buffers: {[index: string]: WebGLBuffer}
  private attributes: {[index: string]: number}
  private uniforms: {[index: string]: WebGLUniformLocation}
  private textureCache: WeakMap<HTMLImageElement | ImageData, WebGLTexture> = new WeakMap()
  private lastTextureUsed: Option<HTMLImageElement | ImageData> = None()
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
    this.buffers = {}
    this.attributes = {}
    this.uniforms = {}
    this.program = initShaderProgram(
      this.gl,
      readFileSync(`${__dirname}/../assets/shader.v.glsl`, {encoding: "utf8"}),
      readFileSync(`${__dirname}/../assets/shader.f.glsl`, {encoding: "utf8"}),
    )
    if (this.program.state === OptionState.None) {
      throw new Error("There is no GLProgram")
    }
    this.gl.useProgram(this.program.value)
    this.buffers = {
      vbo: createBuffer(this.gl),
      ebo: createBuffer(this.gl),
      imageEbo: createBuffer(this.gl), 
    }
    const elements = [0, 1, 2, 1, 3, 2]
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.imageEbo)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements), this.gl.STATIC_DRAW)
    this.attributes = {
      a_position: getAttributeLocation(this.gl, this.program.value, "a_position"),
      a_texCoord: getAttributeLocation(this.gl, this.program.value, "a_texCoord"),
    }
    this.uniforms = {
      u_type: getUniformLocation(this.gl, this.program.value, "u_type"),
      u_color: getUniformLocation(this.gl, this.program.value, "u_color"),
      u_tex: getUniformLocation(this.gl, this.program.value, "u_tex"),
      u_transformation: getUniformLocation(this.gl, this.program.value, "u_transformation"),
    }
    const texture = createTexture(this.gl)
    this.gl.uniform1i(this.uniforms.u_tex, 0)
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                  1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, Uint8Array.from([0,0,0,0]))
    this.setTransformMatrix(Matrix.identity())
  }
  text (
    font: Font,
    message: string,
    position: Vector2,
  ) : void
  {
    const image = font.imageData
    const offset = {...position}
    const ss: Vector2 = {x: image.width, y: image.height}
    const vertices: number[][] = message.split("").reduce((vs: number[][], l) => {
        const g = font.glyphs[l]
        const { x, y } = g.size
        const tcl: Vector2 = {x: g.position.x / ss.x, y: g.position.y / ss.y}
        const tch: Vector2 = {x: tcl.x + (g.size.x / ss.x), y: tcl.y + (g.size.y / ss.y)}
        const {x: ox, y: oy} = g.origin
        const {x: vx, y: vy} = offset
        offset.x = offset.x + g.spacing
        vs.push([
           0+vx+ox, y+vy+oy,  tcl.x, tcl.y,
           x+vx+ox, y+vy+oy,  tch.x, tcl.y,
           0+vx+ox, 0+vy+oy,  tcl.x, tch.y,
           x+vx+ox, 0+vy+oy,  tch.x, tch.y,
        ])
        return vs
      }, [])
    this.setTexture(font.imageData)
    const elements = vertices.map((_,i) => {
        const o = i*4
        return [0+o, 1+o, 2+o, 1+o, 3+o, 2+o]
      })
      .reduce((as, a)=>as.concat(a), [])
    this.drawImage(vertices.reduce((as, a)=>as.concat(a), []), elements)
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
  /* TODO(danny): Utilize Texture Slots
    We need a buffer that is 16 long and keeps track of images uploaded
    to the GPU. When it is time to evict another image from the buffer,
    find the least recently used image and evict that.
    
    When it comes time ot drawing and switching textures,
    make sure it is completely transparent to the library consumer
    we are doing this.
  */
  setTexture(
    image: HTMLImageElement | ImageData,
  )
  {
    if (this.lastTextureUsed.state === OptionState.Some
        && this.lastTextureUsed.value === image) {
      return
    }
    let texture = this.textureCache.get(image)
    if (!texture) {
      texture = createTexture(this.gl)
      this.textureCache.set(image, texture)
      this.gl.uniform1i(this.uniforms.u_tex, 0)
      this.gl.activeTexture(this.gl.TEXTURE0)
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
      //QUESTION(danny): Should this be user settable?
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    }
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0,
      this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
      image,
    )
    this.lastTextureUsed = Some(image)
  }
  private drawImage (
    vertices: number[],
    elements?: number[],
  )
  {
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
    if (typeof elements !== "undefined") {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.ebo)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements), this.gl.STATIC_DRAW)
      this.gl.drawElements(
        this.gl.TRIANGLES,
        elements.length,
        this.gl.UNSIGNED_SHORT,
        0
      )
    } else {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.imageEbo)
      this.gl.drawElements(
        this.gl.TRIANGLES,
        6,
        this.gl.UNSIGNED_SHORT,
        0
      )
    }
    this.gl.disableVertexAttribArray(this.attributes.a_texCoord)
    this.gl.disableVertexAttribArray(this.attributes.a_position)
  }
  image (
    image: HTMLImageElement
  )
  {
    this.setTexture(image)
    const x = image.naturalWidth
    const y = image.naturalHeight
    const vertices = [
       0, y,  0, 0,
       x, y,  1, 0,
       0, 0,  0, 1,
       x, 0,  1, 1,
    ]
    this.drawImage(vertices)
  }
  sprite (
    image: HTMLImageElement | ImageData,
    position: Vector2,
    size: Vector2,
  )
  {
    this.setTexture(image)
    let ss: Vector2
    if (image instanceof HTMLImageElement) {
      ss = {x: image.naturalWidth, y: image.naturalHeight}
    } else {
      ss = {x: image.width, y: image.height}
    }
    const { x, y } = size
    const tcl: Vector2 = {x: position.x / ss.x, y: position.y / ss.y}
    const tch: Vector2 = {x: tcl.x + (size.x / ss.x), y: tcl.y + (size.y / ss.y)}
    const vertices = [
       0, y,  tcl.x, tcl.y,
       x, y,  tch.x, tcl.y,
       0, 0,  tcl.x, tch.y,
       x, 0,  tch.x, tch.y,
    ]
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
           0+vx, y+vy,  tcl.x, tcl.y,
           x+vx, y+vy,  tch.x, tcl.y,
           0+vx, 0+vy,  tcl.x, tch.y,
           x+vx, 0+vy,  tch.x, tch.y,
        ]
      })
      .reduce((as, a)=>as.concat(a), [])
    const elements = positions.map((_,i) => {
        const o = i*4
        return [0+o, 1+o, 2+o, 1+o, 3+o, 2+o]
      })
      .reduce((as, a)=>as.concat(a), [])
    this.drawImage(vertices, elements)
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
    this.gl.disableVertexAttribArray(this.attributes.a_position)
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
  point (
    position: Vector2,
  )
  {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([position.x, position.y]), this.gl.STATIC_DRAW)
    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.enableVertexAttribArray(this.attributes.a_position)
    this.gl.uniform1i(this.uniforms.u_type, 0)
    this.gl.drawArrays(this.gl.POINTS, 0, 1)
    this.gl.disableVertexAttribArray(this.attributes.a_position)
  }
  line (
    vertices: Vector2[]
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
    this.gl.enableVertexAttribArray(this.attributes.a_position)
    this.gl.uniform1i(this.uniforms.u_type, 0)
    this.gl.drawArrays(this.gl.LINE_STRIP, 0, vertices.length)
    this.gl.disableVertexAttribArray(this.attributes.a_position)
  }
}
