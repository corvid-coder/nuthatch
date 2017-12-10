import { Audio } from "/audio.js"

const audio = new Audio()
async function main () {
  const one = await audio.load(`./count_1.ogg`)
  const two = await audio.load(`./count_2.ogg`)
  const three = await audio.load(`./count_3.ogg`)
  audio.play(three)
  setTimeout(() => audio.play(two), 1000)
  setTimeout(() => audio.play(one), 2000)
}
main()