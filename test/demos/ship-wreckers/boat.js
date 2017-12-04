import Matrix from "/matrix.js"
import { Vector2 } from "/vector.js"
import { graphics, keyboard, matrix, cannonballs, drawShape } from "./game.js"
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
    [
      {
        x: 340, y: 345
      }, {
        x: 66, y: 113
      },
    ],
    [
      {
        x: 272, y: 115
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
    [
      {
        x: 272, y: 230
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
const COOL_DOWN = 1

export default class Boat {
  constructor (player = 1) {
    this.lastShoot = COOL_DOWN
    this.player = player
    this.velocity = SPEED
    this.health = 3
    if (this.player === 1) {
      this.angle = 0
      this.position = { x: 50, y: 50 }
      this.controls = {
        left: "ArrowLeft",
        right: "ArrowRight",
        shoot: "ArrowUp",
      }
      this.sprites = SPRITES[0]
    } else {
      this.angle = Math.PI
      this.position = { x: 750, y: 550 }
      this.controls = {
        left: "KeyA",
        right: "KeyD",
        shoot: "KeyW",
      }
      this.sprites = SPRITES[1]
    }
  }
  damage () {
    this.health -= 1
    if (this.health < 1) {
      this.REMOVE_ME = true
    }
  }
  shoot () {
    cannonballs.add(new Cannonball(this, this.position, this.angle))
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
  draw () {
    matrix.save()
    matrix.translate(this.position),
    matrix.scale({x: SIZE, y: SIZE}),
    matrix.rotate(this.angle),
    matrix.rotate(Math.PI),
    matrix.translate({ x: -33, y: -56.5 }),
    graphics.setTransformMatrix(matrix.current)
    if (SPRITESHEET.complete) {
      graphics.sprite(SPRITESHEET,
        ...this.sprites[3 - this.health]
      )
    }
    if (DEBUG) {
      drawShape(this.toShape())
    }
    matrix.restore()
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