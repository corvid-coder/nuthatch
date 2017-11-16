import Matrix from "/matrix.js"
import { Vector2 } from "/vector.js"
import { graphics, keyboard, orthoMatrix, cannonballs } from "./game.js"
import { SPRITESHEET } from "./constants.js"
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
    cannonballs.add(new Cannonball(this.position, this.angle))
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
  }
}