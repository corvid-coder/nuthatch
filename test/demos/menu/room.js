import { graphics, keyboard, stateManager } from "./game.js"

export class Room {
  constructor (name, color) {
    this.name = name
    this.color = color
  }
  enter () {
    console.log(`Welcome to ${this.name}! Escape to go back.`)
  }
  leave () {}
  destroy () {}
  update(dt) {
    if (keyboard.isKeyDown(`escape`)) {
      stateManager.pop()
    }
  }
  draw () {
    graphics.clear(this.color)
  }
}
