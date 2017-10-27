import { Vector2 } from "./vector.js"

export type mat4x4 =
[
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
]

export type radian = number

const longestNumber = (m: mat4x4) => Math.max(...m.map(n=>n.toString().length))
const fmt = (n: number, l: number) => n.toString().padEnd(l)

export default class Matrix {
  static print (m: mat4x4) {
    const l = longestNumber(m)
    console.log(
`[${fmt(m[0], l)} ${fmt(m[1], l)} ${fmt(m[2], l)} ${fmt(m[3], l)}
 ${fmt(m[4], l)} ${fmt(m[5], l)} ${fmt(m[6], l)} ${fmt(m[7], l)}
 ${fmt(m[8], l)} ${fmt(m[9], l)} ${fmt(m[10], l)} ${fmt(m[11], l)}
 ${fmt(m[12], l)} ${fmt(m[13], l)} ${fmt(m[14], l)} ${fmt(m[15], l)}]`
    )
  }
  static clone (m: mat4x4) : mat4x4 {
    return [...m] as mat4x4
  }
  static identity () : mat4x4 {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]
  }
  static orthographic (width: number, height: number) : mat4x4 {
    const left = 0
    const right = width
    const top = height
    const bottom = 0
    const near = 100
    const far = -100
    const lr = 1 / (left - right)
    const bt = 1 / (bottom - top)
    const nf = 1 / (near - far)
    const row0col3 = (left + right) * lr;
    const row1col3 = (top + bottom) * bt;
    const row2col3 = (far + near) * nf;
    return [
      -2 * lr,  0,      0,      row0col3,
       0,      -2 * bt, 0,      row1col3,
       0,       0,      2 * nf, row2col3,
       0,       0,      0,      1,
    ]
  }
  static dotMultiply (m1: mat4x4, m2: mat4x4) : mat4x4 {
    const a = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12];
    const b = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13];
    const c = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14];
    const d = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];
    const e = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12];
    const f = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13];
    const g = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14];
    const h = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];
    const i = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12];
    const j = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13];
    const k = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14];
    const l = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];
    const m = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12];
    const n = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13];
    const o = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
    const p = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];
    return [
      a, b, c, d,
      e, f, g, h,
      i, j, k, l,
      m, n, o, p,
    ]
  }
  static multiplyPoint (m: mat4x4, v: Vector2<number>) : Vector2<number> {
    const {x, y} = v
    //NOTE: z is always 0, w is always 1 for 2d space
    const z = 0
    const w = 1
    return {
      x: x * m[0] + y * m[1] + z * m[2] + w * m[3],
      y: x * m[4] + y * m[5] + z * m[6] + w * m[7],
    }
  }
  static translate (v: Vector2<number>) : mat4x4 {
    const m = Matrix.identity()
    m[3] += v.x
    m[7] += v.y
    return m
  }
  static scale (v: Vector2<number>) : mat4x4 {
    const m = Matrix.identity()
    m[0] *= v.x
    m[5] *= v.y
    return m
  }
  static rotate (a: radian) : mat4x4 {
    const m = Matrix.identity()
    m[0] = Math.cos(a)
    m[1] = -Math.sin(a)
    m[4] = Math.sin(a)
    m[5] = Math.cos(a)
    return m
  }
}