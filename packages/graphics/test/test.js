import Graphics from "/index.js"

const graphics = new Graphics(document.body)
graphics.clear({r: 0, g: 0, b: 0, a: 1})
const randPos = () => Math.random() * 2 - 1
setInterval(() => {
  // graphics.clear()
  graphics.setColor(
    {r: Math.random(), g: Math.random(), b: Math.random(), a: 1},
  )
  graphics.triangle(
    {x: randPos(), y: randPos()},
    {x: randPos(), y: randPos()},
    {x: randPos(), y: randPos()},
  )
}, 200)