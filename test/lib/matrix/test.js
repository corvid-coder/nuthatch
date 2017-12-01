import Matrix from "/matrix.js"

//TODO: Need asserts to test validity
const I = Matrix.identity()
console.log(I)
Matrix.print(I)
const v2 = {x: 1, y: 2}
{
  const m1 = [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 16,
  ]
  const m2 = [
    17, 18, 19, 20,
    21, 22, 23, 24,
    25, 26, 27, 28,
    29, 30, 31, 32,
  ]
  const result = Matrix.dotMultiply(m1, m2)
  Matrix.print(result)
}
{
  const result = Matrix.multiplyPoint(I, v2)
  console.log(result)
}
{
  const t = {x: 4, y: 5}
  const M = Matrix.translate(t)
  Matrix.print(M)
  const result = Matrix.multiplyPoint(M, v2)
  console.log(result)
}
{
  const s = {x: 2, y: 5}
  const M = Matrix.scale(s)
  Matrix.print(M)
  const result = Matrix.multiplyPoint(M, v2)
  console.log(result)
}
{
  const r = Math.PI / 2
  const M = Matrix.rotate(r)
  Matrix.print(M)
  const result = Matrix.multiplyPoint(M, v2)
  console.log(result)
}
{
  const M = Matrix.orthographic({x: 300, y: 300})
  Matrix.print(M)
  const p = {x: 150, y:300}
  const result = Matrix.multiplyPoint(M, p)
  console.log(result)
}
