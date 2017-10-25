import { graphics, keyboard } from "./game.js"
import { GRAVITY } from "./constants.js"
import BB from "./bb.js"

export const JUMP_FORCE = 2
export const SIZE = 0.05

export default class Bird {
  constructor () {
    this.position = {x: 0, y: 0}
    this.velocity = {x: 0, y: 0}
  }
  update (dt) {
    this.position.y += this.velocity.y * dt
    this.velocity.y += GRAVITY * dt
    if (keyboard.isKeyDown("Space")) {
      this.velocity.y = -JUMP_FORCE
    }
  }
  draw () {
    graphics.setColor({r: 1, g: 0, b: 0, a: 1})
    graphics.circle(
      this.position,
      SIZE
    )
  }
  getShapes () {
    return [
      new BB(
        this.position.x - SIZE, this.position.y - SIZE,
        this.position.x + SIZE, this.position.y + SIZE,
      ),
    ]
  }
}