import Matrix from "/matrix.js"
import { Vector2 } from "/vector.js"
import { graphics, matrix, drawShape } from "./game.js"
import { SPRITESHEET, DEBUG } from "./constants.js"

const SPRITE = [
  {
    x: 119, y: 421
  }, {
    x: 12, y: 12
  },
]

const SCALE = 1
const RADIUS = 6
const SPEED = 300
const SECONDS_TO_LIVE = 1

export default class Cannonball {
  constructor (originator, position, angle) {
    this.originator = originator
    this.REMOVE_ME = false
    this.position = position
    this.angle = angle
    this.speed = SPEED
    this.SECONDS_ALIVE = 0
  }
  update (dt) {
    const velocityV = Vector2.multiply(Vector2.rotate({x: 0, y: 1}, this.angle), this.speed)
    this.position = Vector2.add(this.position, Vector2.multiply(velocityV, dt))
    this.SECONDS_ALIVE += dt
    if (this.SECONDS_ALIVE > SECONDS_TO_LIVE) {
      this.REMOVE_ME = true
    }
  }
  draw () {
    matrix.save()
    matrix.translate(this.position),
    matrix.scale({x: SCALE, y: SCALE}),
    matrix.rotate(this.angle),
    matrix.translate({ x: -6, y: -6 }),
    graphics.setTransformMatrix(matrix.current)
    if (SPRITESHEET.complete) {
      graphics.sprite(SPRITESHEET,
        ...SPRITE
      )
    }
    if (DEBUG) {
      drawShape(this.toShape())
    }
    matrix.restore()
  }
  toShape () {
    const ms = [
      Matrix.translate({ x: -6, y: -6 }),
      Matrix.rotate(this.angle),
      Matrix.scale({x: SCALE, y: SCALE}),
      Matrix.translate(this.position),
    ]
    const m = Matrix.dotMultiplyAll(ms)
    const {x, y} = this.position
    return new SAT.Circle(new SAT.Vector(x, y), RADIUS)
  }
}