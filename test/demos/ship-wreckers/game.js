import Runtime from "/runtime.js"
import Graphics from "/graphics.js"
import Keyboard from "/keyboard.js"
import Matrix, { MatrixState } from "/matrix.js"

import Boat from "./boat.js"
import Map from "./map.js"
import { DEBUG, SCREEN } from "./constants.js"

export const keyboard = new Keyboard()
export const graphics = new Graphics(document.body, SCREEN)
export const matrix = new MatrixState(Matrix.orthographic(SCREEN))

export const cannonballs = new Set()
export const boats = new Set()

export function drawShape(shape) {
  graphics.setTransformMatrix(matrix.current)
  graphics.setColor({r: 1, g: 1, b: 1, a: 0.25})
  if (shape instanceof SAT.Circle) graphics.circle(shape.pos, shape.r)
  if (shape instanceof SAT.Polygon) graphics.polygon(shape.calcPoints)
}
      
graphics.setup("/")
  .then(() => {
    const runtime = new Runtime()
    let test_cb
    const map = new Map()
    boats.add(new Boat(1))
    boats.add(new Boat(2))
    runtime.update = (dt) => {
      boats.forEach(b=>{
        b.update(dt)
      })
      cannonballs.forEach(cb=>{
        cb.update(dt)
      })
      boats.forEach(b=> {
        b.position.x = Math.min(b.position.x, SCREEN.x)
        b.position.x = Math.max(b.position.x, 0)
        b.position.y = Math.min(b.position.y, SCREEN.y)
        b.position.y = Math.max(b.position.y, 0)
        const bs = b.toShape()
        cannonballs.forEach(cb=> {
          const cbs = cb.toShape()
          if (cb.originator !== b) {
            if(SAT.testPolygonCircle(bs, cbs)) {
              b.damage()
              cb.REMOVE_ME = true
            }
          }
        })
      })
      boats.forEach(b=>{
        if (b.REMOVE_ME) {
          boats.delete(b)
        }
      })
      cannonballs.forEach(cb=>{
        if (cb.REMOVE_ME) {
          cannonballs.delete(cb)
        }
      })
    }
    runtime.draw = () => {
      graphics.setTransformMatrix(matrix.current)
      graphics.clear({r: 0, g: 0, b: 0, a: 1})
      map.draw()
      boats.forEach(b=>b.draw())
      cannonballs.forEach(cb=>cb.draw())
      if (DEBUG) {
        drawShape(test_cb)
      }
    }
    runtime.start()
  })
  .catch((err) => console.error(err))
