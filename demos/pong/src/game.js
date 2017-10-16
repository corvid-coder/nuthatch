import Runtime from "/node_modules/@nuthatch/runtime/index.js"
import Graphics from "/node_modules/@nuthatch/graphics/index.js"
import Keyboard from "/node_modules/@nuthatch/keyboard/index.js"
import Ball from "./ball.js"
import Paddle from "./paddle.js"

export const keyboard = new Keyboard()
export const graphics = new Graphics(document.body)
const runtime = new Runtime()

const balls = [
  new Ball(),
]

const paddles = [
  new Paddle(1),
  new Paddle(2),
]

runtime.update = (dt) => {
  balls.forEach(b=>b.update(dt))
  paddles.forEach(p=>p.update(dt))
}
runtime.draw = () => {
  graphics.clear({r: 0, g: 0, b: 0, a: 1})
  paddles.forEach(p => p.draw())
  balls.forEach(b => b.draw())
  balls.forEach(b => {
    paddles.forEach(p => {
      if (!(p.position.x + p.size.x < b.position.x - b.radius) &&
          !(p.position.x > b.position.x + b.radius) &&
          !(p.position.y + p.size.y < b.position.y - b.radius) &&
          !(p.position.y > b.position.y + b.radius)) {
        b.velocity.x *= -1
      }
    })
  })
}
runtime.start()
