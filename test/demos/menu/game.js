import Runtime from "/runtime.js"
import Graphics from "/graphics.js"
import Keyboard from "/keyboard.js"
import { StateManager } from "/state.js"
import Menu from "./menu.js"

export const keyboard = new Keyboard()
export const graphics = new Graphics(document.body)

export const stateManager = new StateManager()

graphics.setup("/")
  .then(() => {
    const runtime = new Runtime()
    stateManager.push(new Menu())
    runtime.update = (dt) => {
      stateManager.update(dt)
    }
    runtime.draw = () => {
      stateManager.draw()
    }
    runtime.start()
  })
  .catch((err) => console.error(err))
