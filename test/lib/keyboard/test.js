import Keyboard from "/keyboard.js"

const keyboard = new Keyboard()
setInterval(() => {
  console.log(keyboard.isKeyDown("e"))
}, 100)