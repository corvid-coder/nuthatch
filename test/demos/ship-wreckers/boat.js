import Matrix from "/matrix.js"
import { graphics, keyboard, orthoMatrix } from "./game.js"
import { SPRITESHEET } from "./constants.js"

const BOAT_SPRITES = [
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

const BOAT_TURN_SPEED = 0.3 * 2 * Math.PI
const BOAT_SPEED = 200
const BOAT_SIZE = 0.5

export default class Boat {
  constructor () {
    this.velocity = BOAT_SPEED
    this.angle = 0
    this.position = { x: 0, y: 0 }
  }
  update (dt) {
    if (keyboard.isKeyDown("ArrowLeft")) {
      this.angle += BOAT_TURN_SPEED * dt
    }
    if (keyboard.isKeyDown("ArrowRight")) {
      this.angle += -BOAT_TURN_SPEED * dt
    }
    //TODO: Vector2.add(this.position, Vector2.mult(this.velocity, dt))
    this.position.x += this.velocity * dt * Math.cos(this.angle + Math.PI / 2)
    this.position.y += this.velocity * dt * Math.sin(this.angle + Math.PI / 2)
  }
  draw () {
    const ms = [
      Matrix.translate({ x: -33, y: -56.5 }),
      Matrix.rotate(Math.PI),
      Matrix.rotate(this.angle),
      Matrix.translate(this.position),
      Matrix.scale({x: BOAT_SIZE, y: BOAT_SIZE}),
      orthoMatrix,
    ]
    graphics.setTransformMatrix(Matrix.dotMultiplyAll(ms))
    if (SPRITESHEET.complete) {
      graphics.sprite(SPRITESHEET,
        ...BOAT_SPRITES[0][0]
      )
    }
  }
}