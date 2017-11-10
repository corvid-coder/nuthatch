import Runtime from "/runtime.js"
import Graphics from "/graphics.js"
import Keyboard from "/keyboard.js"
import Ball from "./ball.js"
import Paddle from "./paddle.js"

export const keyboard = new Keyboard()
export const graphics = new Graphics(document.body)
graphics.setup("/")
  .then(() => {
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
  })
  .catch((err) => console.error(err))
