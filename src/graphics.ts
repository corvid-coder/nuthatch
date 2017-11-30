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

export interface FontFace {
  family: string,
  size: string,
  weight: number,
  style: string,
}

export const ENGLISH = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  ")", "!", "@", "#", "$", "%", "^", "&", "*", "(",
  "-", "=", "[", "]", ";", "'", ",", ".", "/", "`", "\\",
  "_", "+", "{", "}", ":", "\"", "<", ">", "?", "~", "|",
]

export interface Glyph {
  /*INFO(danny):
    character: the letter represented ex "a" "j" " "
    origin: the beginning of the letter's baseline
    position: location of sprite in spritesheet
    size: the bounding box of the sprite
    spacing - distance from origin to the next letter
  */
  character: string,
  origin: Vector2,
  position: Vector2,
  size: Vector2,
  spacing: number,
}

export interface Font {
  
}

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
    const elements = [0, 1, 2, 1, 3, 2]
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.imageEbo)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements), this.gl.STATIC_DRAW)
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
    const texture = createTexture(this.gl)
    this.gl.uniform1i(this.uniforms.u_tex, 0)
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                  1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, Uint8Array.from([0,0,0,0]))
    this.setTransformMatrix(Matrix.identity())
  }
  createFont (
    font: FontFace,
    characters: string[],
  ) : Font
  {
    const el = document.createElement(`div`)
    el.style.fontSize = font.size
    document.body.appendChild(el)
    const sizeInPx = parseInt(getComputedStyle(el).fontSize!)
    document.body.removeChild(el)
    const glyphs = characters.map(c => this.createGlyph(font, c, sizeInPx))
    // const canvas = document.createElement(`canvas`)
    // document.body.appendChild(canvas)
    // canvas.width = glyph.size.x
    // canvas.height = glyph.size.y
    // const context = canvas.getContext(`2d`)!
    //TODO(danny): This needs to be an atlas
    // context.putImageData(imageData, 0, 0)
  }
  private createGlyph (
    font: FontFace,
    character: string,
    sizeInPx: number,
  ) : [Glyph, ImageData]
  {
    const width = sizeInPx * 2
    const height = width
    const canvas = document.createElement(`canvas`)
    canvas.width = width
    canvas.height = height
    const origin : Vector2 = {
      x: width / 3,
      y: height * 2 / 3,
    }
    const context = canvas.getContext(`2d`)!
    //TODO(danny): font-style font-variant font-weight
    context.font = `${font.size} ${font.family}`
    if (character === ` `) {
      const el = document.createElement(`div`)
      el.style.fontSize = "calc(1 / 3em)" 
      document.body.appendChild(el)
      const spacing = parseInt(getComputedStyle(el).fontSize!)
      document.body.removeChild(el)
      return [
        {
          character,
          origin: {x: 0, y: 0},
          size: {x: spacing, y: 1},
          position: {x: 0, y: 0},
          spacing,
        },
        context.createImageData(spacing, 1),
      ]
    }
    context.fillText(character, origin.x, origin.y)
    const spacing = context.measureText(character).width
    const imageData = context.getImageData(0, 0, width, height)
    const l = this.getLeftBound(imageData)
    const r = this.getRightBound(imageData)
    const t = this.getTopBound(imageData)
    const b = this.getBottomBound(imageData)
    const glyphImageData = context.getImageData(l, t, r-l, b-t)
    if (false) {
      // @ts-ignore: Unreachable code error
      document.body.appendChild(canvas)
      context.strokeStyle = "hsla(0, 100%, 50%, 0.5)"
      context.setLineDash([5, 5]);
      context.beginPath()
      context.moveTo(origin.x, 0)
      context.lineTo(origin.x, height)
      context.stroke()
      context.beginPath()
      context.moveTo(0, origin.y)
      context.lineTo(width, origin.y)
      context.stroke()
      context.beginPath()
      context.strokeStyle = "hsla(140, 100%, 50%, 0.5)"
      context.moveTo(origin.x + spacing, 0)
      context.lineTo(origin.x + spacing, height)
      context.stroke()
      context.strokeStyle = "hsla(240, 100%, 50%, 0.5)"
      context.setLineDash([5, 0]);
      context.beginPath()
      context.moveTo(l, t)
      context.lineTo(r, t)
      context.lineTo(r, b)
      context.lineTo(l, b)
      context.lineTo(l, t)
      context.stroke()
    }
    return [
      {
        character,
        origin: {x: origin.x - l, y: origin.y - t},
        size: {x: r - l, y: b - t},
        position: {x: 0, y: 0},
        spacing,
      },
      glyphImageData,
    ]
  }
  getLeftBound(
    imageData: ImageData
  ) : number
  {
    const width = imageData.width
    const height = imageData.height
    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        const a = imageData.data[(x + y * width) * 4 + 3]
        if (a > 0) {
          return x - 2
        }
      }
    }
    return -1
  }
  getRightBound(
    imageData: ImageData
  ) : number
  {
    const width = imageData.width
    const height = imageData.height
    for (var x = width-1; x >= 0; x--) {
      for (var y = 0; y < height; y++) {
        const a = imageData.data[(x + y * width) * 4 + 3]
        if (a > 0) {
          return x + 2
        }
      }
    }
    return -1
  }
  getTopBound(
    imageData: ImageData
  ) : number
  {
    const width = imageData.width
    const height = imageData.height
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        const a = imageData.data[(x + y * width) * 4 + 3]
        if (a > 0) {
          return y - 2
        }
      }
    }
    return -1
  }
  getBottomBound(
    imageData: ImageData
  ) : number
  {
    const width = imageData.width
    const height = imageData.height
    for (var y = height - 1; y >= 0; y--) {
      for (var x = 0; x < width; x++) {
        const a = imageData.data[(x + y * width) * 4 + 3]
        if (a > 0) {
          return y + 2
        }
      }
    }
    return -1
  }
  
  text (
    font: Font,
    message: string,
  ) : void
  {
    
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
  /* TODO(danny):
    We need a buffer that is 16 long and keeps track of images uploaded
    to the GPU. When it is time to evict another image from the buffer,
    find the least recently used image and evict that.
    
    When it comes time ot drawing and switching textures,
    make sure it is completely transparent to the library consumer
    we are doing this.
  */
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
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
      //QUESTION(danny): Should this be user settable?
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    }
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                  this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
    this.lastTextureUsed = image
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
}

export default Graphics