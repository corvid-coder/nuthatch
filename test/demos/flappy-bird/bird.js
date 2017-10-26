import { graphics, keyboard } from "./game.js"
import { GRAVITY } from "./constants.js"
import Matrix from "/lib/matrix.js"
import BB from "./bb.js"

export const IMAGE = new Image()
IMAGE.src = "./fishTile_101.png"
export const JUMP_FORCE = 2
export const SIZE = 0.05

export default class Bird {
  constructor () {
    this.position = {x: 0  , y: 0}
    this.velocity = {x: 0, y: 0}
  }
  update (dt) {
    this.position.y += this.velocity.y * dt
    this.velocity.y -= GRAVITY * dt
    if (keyboard.isKeyDown("Space")) {
      this.velocity.y = JUMP_FORCE
    }
  }
  draw () {
    graphics.setColor({r: 1, g: 0, b: 0, a: 1})
    if (IMAGE.complete) {
      // graphics.setTransformMatrix(Matrix.translate({x: -this.position.x, y: -this.position.y} ))
      const sm = Matrix.scale({x: 0.15, y: 0.15  })
      const om = Matrix.translate({x: -64/150, y: -64/150})
      const tm = Matrix.translate({x: this.position.x, y: this.position.y })
      let m = Matrix.multiply(tm, sm)
      m = Matrix.multiply(m, om)
      graphics.setTransformMatrix(m)
      graphics.image(IMAGE)
    }
    graphics.setTransformMatrix(Matrix.identity())
  }
  getShapes () {
    return [
      new BB(
        this.position.x - SIZE, this.position.y - SIZE,
        SIZE * 2, SIZE * 2,
      ),
    ]
  }
}