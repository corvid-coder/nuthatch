import Keyboard from "/index.js"

const keyboard = new Keyboard()
setInterval(() => {
  console.log(keyboard.isKeyDown("e"))
}, 100)