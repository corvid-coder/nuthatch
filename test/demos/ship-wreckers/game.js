import Runtime from "/runtime.js"
import Graphics from "/graphics.js"
import Keyboard from "/keyboard.js"
import Matrix from "/matrix.js"

import Boat from "./boat.js"

export const keyboard = new Keyboard()
export const graphics = new Graphics(document.body, {x: 800, y: 600})

export const orthoMatrix = Matrix.orthographic(graphics.gl.canvas.width, graphics.gl.canvas.height)

graphics.setup("/")
  .then(() => {
    const runtime = new Runtime()
    const boats = [
      new Boat()
    ]
    runtime.update = (dt) => {
      boats.forEach(b=>b.update(dt))
    }
    runtime.draw = () => {
      graphics.setTransformMatrix(orthoMatrix)
      graphics.clear({r: 0, g: 0, b: 0, a: 1})
      boats.forEach(b=>b.draw())
    }
    runtime.start()
  })
  .catch((err) => console.error(err))
