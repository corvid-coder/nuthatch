import Graphics from "/index.js"

const graphics = new Graphics(document.body)
graphics.clear({r: 0, g: 0, b: 0, a: 0})
// graphics.triangle()
// const v1 = {x: 1, y: 1}
// const v2 = {x: 1, y: -1.0}
// const v3 = {x: -1, y: -1}
// const color = {r: 0, g: 1, b: 0, a: 1.0}
// graphics.triangle(v1, v2, v3, color)
// graphics.triangle({x: 0, y: 1}, {x: 0, y: 0.5}, {x: -0.5, y: 1}, {r: 1, g: 0, b: 0, a: 1})
// 
const randPos = () => Math.random() * 2 - 1

setInterval(() => {
  // graphics.clear()
  graphics.triangle(
    {x: randPos(), y: randPos()},
    {x: randPos(), y: randPos()},
    {x: randPos(), y: randPos()},
    {r: Math.random(), g: Math.random(), b: Math.random(), a: 1}
  )
}, 200)