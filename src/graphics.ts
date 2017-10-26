import { Vector2 } from "./vector.js"
import Matrix, { mat4x4 } from "./matrix.js"
import {
  Program,
  getContext,
  initShaderProgram,
  getAttributeLocation,
  getUniformLocation,
  createBuffer,
} from "./webgl2.js"

//QUESTION: Should this just be a vector?
//IDEA: getters on Vector4
export interface Color {
  r: number,
  g: number,
  b: number,
  a: number,
}

function getSource (
  filename: string
) : Promise<string> {
  return fetch(filename)
    .then((res) => res.text())
}

class Graphics
{
  private gl : WebGL2RenderingContext
  private programs: { [index: string]: Program } = {}
  private program: Program
  private transformMatrix : mat4x4
  constructor (
    target: HTMLElement,
  )
  {
    const canvas = document.createElement(`canvas`) as HTMLCanvasElement
    //TODO: allow user to specify
    canvas.height = canvas.width
    this.gl = getContext(canvas)
    //TODO: allow user to specify location
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
      await getSource(`${pathToNuthatch}/assets/shape.v.glsl`),
      await getSource(`${pathToNuthatch}/assets/shape.f.glsl`),
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
    this.program = this.programs.triangle
    this.gl.useProgram(program)
    //TODO: clean this up
    this.setTransformMatrix(Matrix.identity())
    program = initShaderProgram(
      this.gl,
      await getSource(`${pathToNuthatch}/assets/image.v.glsl`),
      await getSource(`${pathToNuthatch}/assets/image.f.glsl`),
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
        //TEMP: u_color: getUniformLocation(this.gl, program, "u_color"),
        u_tex: getUniformLocation(this.gl, program, "u_tex"),
        u_trans: getUniformLocation(this.gl, program, "u_trans"),
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
  setColor (
    color: Color
  )
  {
    //IDEA: save locally and set uniform on draw calls
    this.gl.useProgram(this.programs.triangle.program)
    this.gl.uniform4f(
      this.programs.triangle.uniforms.u_color,
      color.r,
      color.g,
      color.b,
      color.a,
    )
  }
  setTransformMatrix(
    m: mat4x4,
  )
  {
    this.transformMatrix = m
    this.gl.uniformMatrix4fv(this.program.uniforms.u_trans, true, m)
  }
  image (
    image: HTMLImageElement
  )
  {
    this.program = this.programs.image
    this.gl.useProgram(this.programs.image.program)
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true)
    this.gl.uniformMatrix4fv(this.program.uniforms.u_trans, true, this.transformMatrix)
    //QUESTION: Should this be done only once?
    //IDEA: Image object that contains texture
    const texture = this.gl.createTexture()
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.uniform1i(this.programs.image.uniforms.u_tex, 0)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                  this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
    //TODO: support image color modulations and alpha
    // [0, 128] -> [-1, -.38]
    const x2 = image.naturalWidth/(this.gl.canvas.width / 2)
    const y2 = image.naturalHeight/(this.gl.canvas.height / 2)
    const vertices = new Float32Array([
      0,  0,   0, 0,
      x2, 0,   1, 0,
      0, y2,   0, 1,
      x2, y2,   1, 1,
    ])
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.programs.image.buffers.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)
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
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, elements, this.gl.STATIC_DRAW)
    this.gl.drawElements(
      this.gl.TRIANGLES,
      elements.length,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
  private triangles (
    vertices: Vector2<number>[],
    elements: number[],
  )
  {
    this.program = this.programs.triangle
    this.gl.useProgram(this.programs.triangle.program)
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
  // Remove x/y
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