import { graphics, keyboard, stateManager } from "./game.js"
import { Room } from "./room.js"

export default class Menu {
  constructor () {
    console.log("Menu constructed!")
  }
  enter () {
    console.log("Menu entered!")
    console.log(`Hit 'a' to go to room a, 'b' to go to room b.`)
  }
  leave () {
    console.log("Menu left!")
  }
  destroy () {}
  update(dt) {
    if (keyboard.isKeyDown(`a`)) {
      stateManager.push(new Room(`a`, {r: 1, g: 0, b: 0, a: 1}))
      return
    } else if (keyboard.isKeyDown(`b`)) {
      stateManager.push(new Room(`b`, {r: 0, g: 1, b: 0, a: 1}))
      return
    }
  }
  draw () {
      graphics.clear({r: 0, g: 0, b: 0, a: 1})
  }
}
