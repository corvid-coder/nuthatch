import { graphics } from "./game.js"
import BB from "./bb.js"

export const GAP_SIZE = 0.5 
export const SPEED = 1 
export const WIDTH = 0.05

export default class Wall  {
  constructor () {
    this.position = {x: 1, y: -1}
    this.hole = Math.random() * (2 - GAP_SIZE)
  }
  update (dt) {
    this.position.x -= SPEED * dt
  }
  draw () {
    graphics.setColor({r: 1, g: 1, b: 1, a: 1})
    graphics.rectangle(this.position, {x: WIDTH, y: this.hole})
    graphics.rectangle({...this.position, y: this.position.y + this.hole + GAP_SIZE}, {x: WIDTH, y: 2 - this.hole - GAP_SIZE})
  }
  getShapes () {
    return [
      new BB(
        this.position.x, this.position.y,
        this.position.x + WIDTH, this.position.y + this.hole,
      ),
      new BB(
        this.position.x, this.position.y + this.hole + GAP_SIZE ,
        this.position.x + WIDTH, this.position.y + (2 - this.hole - GAP_SIZE),
      ),
    ]
  }
}