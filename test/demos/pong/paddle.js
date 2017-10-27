import { graphics, keyboard } from "./game.js"

export default class Paddle {
  constructor (playerId) {
    this.position = {x: -1, y: -0.2}
    this.size = {x: 0.1, y: 0.4}
    if (playerId == 2) {
      this.position.x = 1 - this.size.x
    }
    this.speed = 1
  }
  update (dt) {
    if (keyboard.isKeyDown("ArrowDown")) {
      this.position.y -= this.speed * dt
    }
    if (keyboard.isKeyDown("ArrowUp")) {
      this.position.y += this.speed * dt
    }
    this.position.y = Math.max(this.position.y, -1)
    this.position.y = Math.min(this.position.y + this.size.y, 1) - this.size.y
  }
  draw () {
    graphics.setColor({r: 1, g: 0, b: 0, a: 1})
    graphics.rectangle(
      this.position,
      this.size,
    )
  }
}