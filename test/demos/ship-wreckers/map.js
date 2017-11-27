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
      const positions = []
      for (var x=0; x<TILES_X; x++) {
        for (var y=0; y<TILES_Y; y++) {
          positions.push({x: x * TILE_SIZE, y: y * TILE_SIZE})
        }
      }
      graphics.spriteBatch(SPRITE, {x: 0, y: 0}, {x: TILE_SIZE, y: TILE_SIZE}, positions)
    }
  }
}