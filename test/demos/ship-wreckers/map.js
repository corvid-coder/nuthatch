import { graphics, orthoMatrix } from "./game.js"
import { SCREEN } from "./constants.js"
import Matrix from "/matrix.js"

const SPRITE = new Image()
SPRITE.src="./tile_73.png"
const TILE_SIZE = 64
const TILES_X = Math.ceil(SCREEN.x / TILE_SIZE)
const TILES_Y = Math.ceil(SCREEN.y / TILE_SIZE)

export default class Map {
  draw () {
    if (SPRITE.complete) {
      for (var x=0; x<TILES_X; x++) {
        for (var y=0; y<TILES_Y; y++) {
          const ms = [
            Matrix.translate({x: x * TILE_SIZE, y: y * TILE_SIZE}),
            orthoMatrix,
          ]
          graphics.setTransformMatrix(Matrix.dotMultiplyAll(ms))
          graphics.image(SPRITE)
        }
      }
    }
  }
}