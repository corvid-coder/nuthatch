export interface Vector2 {
  x: number,
  y: number,
}
export interface Color {
  r: number,
  g: number,
  b: number,
  a: number,
}

export class Vector2 {
  static rotate (v: Vector2, radian: number) : Vector2 {
    return {
      x: v.x * Math.cos(radian) - v.y * Math.sin(radian),
      y: v.x * Math.sin(radian) + v.y * Math.cos(radian),
    }
  }
  static magnitude (v: Vector2) : number {
    return Math.sqrt((v.x ** 2) + (v.y ** 2))
  }
  static normalize (v: Vector2) : Vector2 {
    const magnitude = Vector2.magnitude(v)
    return {
      x: v.x / magnitude,
      y: v.y / magnitude,
    }
  }
  static add (v1: Vector2, v2: Vector2) : Vector2 {
    return {
      x: v1.x + v2.x,
      y: v1.y + v2.y,
    }
  }
  static multiply (v: Vector2, s: number) : Vector2 {
    return {
      x: v.x * s,
      y: v.y * s,
    }
  }
}