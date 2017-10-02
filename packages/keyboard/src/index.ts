//TODO: Enum the keys that can be passed in
const normalizeKeyCode = (code: string) => code.replace("Key", "").toLowerCase()
export default class Keyboard {
  private state : {[index: string]: boolean}
  constructor () {
    this.state = {}
    //TODO: allow deferred event listening
    //TODO: allow custom element attachment
    //TODO: offer both key and code state
    document.addEventListener("keydown", (e) => {
      this.state[normalizeKeyCode(e.code)] = true
    })
    document.addEventListener("keyup", (e) => {
      this.state[normalizeKeyCode(e.code)] = false
    })
  }
  isKeyDown(code: string) : boolean {
    return !!this.state[normalizeKeyCode(code)]
  }
}