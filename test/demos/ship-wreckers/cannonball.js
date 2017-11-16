import Matrix from "/matrix.js"
import { Vector2 } from "/vector.js"
import { graphics, orthoMatrix } from "./game.js"
import { SPRITESHEET } from "./constants.js"

const SPRITE = [
  {
    x: 119, y: 421
  }, {
    x: 12, y: 12
  },
]

const SIZE = 1
const SPEED = 300
const SECONDS_TO_LIVE = 1

export default class Cannonball {
  constructor (position, angle) {
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
    const ms = [
      Matrix.translate({ x: -6, y: -6 }),
      Matrix.rotate(this.angle),
      Matrix.scale({x: SIZE, y: SIZE}),
      Matrix.translate(this.position),
      orthoMatrix,
    ]
    graphics.setTransformMatrix(Matrix.dotMultiplyAll(ms))
    if (SPRITESHEET.complete) {
      graphics.sprite(SPRITESHEET,
        ...SPRITE
      )
    }
  }
}