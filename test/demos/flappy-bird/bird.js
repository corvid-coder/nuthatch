import { graphics, keyboard, orthoMatrix } from "./game.js"
import { GRAVITY } from "./constants.js"
import Matrix from "/matrix.js"
import BB from "./bb.js"

export const IMAGE = new Image()
IMAGE.src = "./fishTile_101.png"
export const JUMP_FORCE = 300
export const SIZE = 20

export default class Bird {
  constructor () {
    this.position = {x: 100, y: 150}
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
      let m = orthoMatrix
      const tm2 = Matrix.translate({x: -64, y: -64})
      m = Matrix.dotMultiply(m, Matrix.translate(this.position))
      m = Matrix.dotMultiply(m, Matrix.scale({x: SIZE / 64, y: SIZE / 64}))
      m = Matrix.dotMultiply(m, Matrix.translate({x: -64, y: -64}))
      graphics.setTransformMatrix(m)
      graphics.image(IMAGE)
    }
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