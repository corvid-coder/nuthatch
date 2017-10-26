import Runtime from "/lib/runtime.js"
import Graphics from "/lib/graphics.js"
import Keyboard from "/lib/keyboard.js"
import Bird from "./bird.js"
import Wall, { WIDTH as WALL_WIDTH } from "./wall.js"

export const keyboard = new Keyboard()
export const graphics = new Graphics(document.body)

graphics.setup("/")
  .then(() => {
    const runtime = new Runtime()

    let birds = [
      new Bird()
    ]

    let walls = [
      new Wall()
    ]

    runtime.update = (dt) => {
      if (birds.length > 0) {
        walls.forEach(w=>w.update(dt))
      }
      walls = walls.filter(w=>w.position.x + WALL_WIDTH > -1 )
      while (walls.length < 1) {
        walls.push(new Wall())
      }
      const collided = walls
        .map(w => w.getShapes())
        .reduce((f, xs) => f.concat(xs), [])
        .reduce((c, ws) => {
          return c || birds
            .map(b => b.getShapes())
            .reduce((f, xs) => f.concat(xs), [])
            .reduce((c, bs) => bs.isColliding(ws),false)
        }, false)
      if (collided) {
        birds = []
      }
      birds.forEach(b=>b.update(dt))
    }
    runtime.draw = () => {
      graphics.clear({r: 0, g: 0, b: 0, a: 1})
      walls.forEach(w=>w.draw())
      birds.forEach(b=>b.draw())
    }
    runtime.start()
  })
  .catch((err) => console.error(err))
