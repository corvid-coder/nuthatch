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