import Graphics from "/index.js"

const graphics = new Graphics(document.body)
graphics.clear({r: 0, g: 0, b: 0, a: 1})
const randPos = () => Math.random() * 2 - 1
const color = {r: Math.random(), g: Math.random(), b: Math.random(), a: 1}
const position = {x: randPos(), y: randPos()}
const size = {x: Math.random(), y: Math.random()}
setInterval(() => {
  color.r = Math.random()
  color.g = Math.random()
  color.b = Math.random()
  graphics.setColor(color)
  position.x = randPos()
  position.y = randPos()
  size.x = Math.random()
  size.y = Math.random()
  graphics.rectangle(position, size)
}, 200)