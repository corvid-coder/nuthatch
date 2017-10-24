import { graphics } from "./game.js"

export default class Ball {
  constructor () {
    this.position = {x: 0, y: 0}
    this.radius = 0.05
    this.velocity = {x: -1, y: -0.5}
  }
  update (dt) {
    this.position.x += this.velocity.x * dt
    this.position.y += this.velocity.y * dt
    if (this.position.y + this.radius > 1) {
      this.velocity.y *= -1
    }
    if (this.position.y - this.radius < -1) {
      this.velocity.y *= -1
    }
  }
  draw () {
    graphics.setColor({r: 1, g: 1, b: 1, a: 1})
    graphics.circle(
      this.position,
      this.radius
    )
  }
}