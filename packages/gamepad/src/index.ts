export default class Gamepads {
  private connected: Boolean[] = [false, false, false, false]
  constructor () {}
  get length (): number {
    return navigator.getGamepads().length
  }
  gamepad (gamepadIndex: number) {
    return navigator.getGamepads()[gamepadIndex]
  }
  available () {
    return Array.from(navigator.getGamepads()).map((v, i) => v ? i : false).filter(i=>i!==false)
  }
}
