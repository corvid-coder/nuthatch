import Runtime from "/runtime.js"

const runtime = new Runtime()
runtime.update = (dt) => {
  console.log(dt)
  console.log(runtime.timeElapsed())
}
runtime.draw = () => {
  console.log("draw")
}
runtime.start()
setTimeout(() => runtime.stop(), 1000)