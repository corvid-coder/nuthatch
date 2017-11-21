import Matrix from "/matrix.js"
import { Vector2 } from "/vector.js"
import { graphics, keyboard, orthoMatrix, cannonballs, drawShape } from "./game.js"
import { SPRITESHEET, DEBUG } from "./constants.js"
import Cannonball from "./cannonball.js"

const SPRITES = [
  [
    [
      {
        x: 68, y: 192
      }, {
        x: 66, y: 113
      },
    ],
  ],
  [
    [
      {
        x: 204, y: 115
      }, {
        x: 66, y: 113
      },
    ],
    [
      {
        x: 0, y: 77
      }, {
        x: 66, y: 113
      },
    ],
  ],
]

const TURN_SPEED = 0.3 * 2 * Math.PI
const SPEED = 125
const SIZE = 0.5
const WIDTH = 66
const HEIGHT = 113
const COOL_DOWN = 0.2

export default class Boat {
  constructor (player = 1) {
    this.lastShoot = COOL_DOWN
    this.player = player
    this.velocity = SPEED
    if (this.player === 1) {
      this.angle = 0
      this.position = { x: 0, y: 0 }
      this.controls = {
        left: "ArrowLeft",
        right: "ArrowRight",
        shoot: "ArrowUp",
      }
      this.sprite = SPRITES[0][0]
    } else {
      this.angle = Math.PI
      this.position = { x: 800, y: 600 }
      this.controls = {
        left: "KeyA",
        right: "KeyD",
        shoot: "KeyW",
      }
      this.sprite = SPRITES[1][0]
    }
  }
  update (dt) {
    this.lastShoot += dt
    if (keyboard.isKeyDown(this.controls.left)) {
      this.angle += TURN_SPEED * dt
    }
    if (keyboard.isKeyDown(this.controls.right)) {
      this.angle += -TURN_SPEED * dt
    }
    if (this.lastShoot > COOL_DOWN) {
      if (keyboard.isKeyDown(this.controls.shoot)) {
        this.shoot()
        this.lastShoot = 0
      }
    }
    const velocityV = Vector2.multiply(Vector2.rotate({x: 0, y: 1}, this.angle), this.velocity)
    this.position = Vector2.add(this.position, Vector2.multiply(velocityV, dt))
  }
  shoot () {
    cannonballs.add(new Cannonball(this, this.position, this.angle))
  }
  draw () {
    const ms = [
      Matrix.translate({ x: -33, y: -56.5 }),
      Matrix.rotate(Math.PI),
      Matrix.rotate(this.angle),
      Matrix.scale({x: SIZE, y: SIZE}),
      Matrix.translate(this.position),
      orthoMatrix,
    ]
    graphics.setTransformMatrix(Matrix.dotMultiplyAll(ms))
    if (SPRITESHEET.complete) {
      graphics.sprite(SPRITESHEET,
        ...this.sprite
      )
    }
    if (DEBUG) {
      drawShape(this.toShape())
    }
  }
  toShape () {
    const ms = [
      Matrix.translate({ x: -33, y: -56.5 }),
      Matrix.rotate(Math.PI),
      Matrix.rotate(this.angle),
      Matrix.scale({x: SIZE, y: SIZE}),
      Matrix.translate(this.position),
    ]
    const m = Matrix.dotMultiplyAll(ms)
    const points = [
       Matrix.multiplyPoint(m, {x: 0, y: 0}),
       Matrix.multiplyPoint(m, {x: WIDTH, y: 0}),
       Matrix.multiplyPoint(m, {x: WIDTH, y: HEIGHT}),
       Matrix.multiplyPoint(m, {x: 0, y: HEIGHT}),
    ]
    const shape = new SAT.Polygon(new SAT.Vector(0, 0), points)
    return shape
  }
}