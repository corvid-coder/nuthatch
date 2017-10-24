import Matrix from "/lib/matrix.js"

const I = Matrix.identity()
console.log(I)
Matrix.print(I)
const v2 = {x: 1, y: 2}
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
//TODO: Do a combinatory transformation
