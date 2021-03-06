export default class BB {
  constructor (x1, y1, w, h) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x1 + w
    this.y2 = y1 + h 
  }
  isColliding (bb) {
    if (!(this.x2 < bb.x1) &&
        !(this.x1 > bb.x2) &&
        !(this.y2 < bb.y1) &&
        !(this.y1 > bb.y2)) {
      return true
    }
    return false
  }
}