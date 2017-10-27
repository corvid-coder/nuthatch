import { graphics, orthoMatrix } from "./game.js"
import BB from "./bb.js"

export const GAP_SIZE = 100
export const SPEED = 150
export const WIDTH = 10

export default class Wall  {
  constructor () {
    this.position = {x: 300, y: 0}
    this.hole = Math.random() * (300 - GAP_SIZE)
  }
  update (dt) {
    this.position.x -= SPEED * dt
  }
  draw () {
    graphics.setTransformMatrix(orthoMatrix)
    graphics.setColor({r: 1, g: 1, b: 1, a: 1})
    graphics.rectangle(
      {x: this.position.x, y: this.position.y + this.hole + GAP_SIZE},
      {x: WIDTH, y: 300 - this.hole - GAP_SIZE}
    )
    graphics.rectangle(this.position, {x: WIDTH, y: this.hole})
  }
  getShapes () {
    return [
      new BB(
        this.position.x, this.position.y + this.hole + GAP_SIZE,
        WIDTH, 300 - (this.hole + GAP_SIZE),
      ),
      new BB( 
        this.position.x, this.position.y,
        WIDTH, this.hole,
      ),
    ]
  }
}