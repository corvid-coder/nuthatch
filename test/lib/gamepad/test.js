import Gamepads from "/lib/gamepad.js"

const gamepads = new Gamepads()
setInterval(() => {
  gamepads.available()
    .map(i=>gamepads.gamepad(i))
    .forEach(gamepad=> {
      console.log(gamepad.id)
      console.log(gamepad.axes[0], gamepad.axes[1])
      console.log(gamepad.axes[2], gamepad.axes[3])
    })
  
}, 100)