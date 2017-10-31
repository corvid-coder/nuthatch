import Runtime from "/lib/runtime.js"
import Graphics from "/lib/graphics.js"
import Matrix from "/lib/matrix.js"

const SPRITESHEET = new Image()
SPRITESHEET.src = "./sokoban_spritesheet@2.png"

const frames = [
  [
    {x: 1085, y: 880},
    {x: 91, y: 100},
  ],
  [
    {x: 986, y: 1096},
    {x: 91, y: 100},
  ],
  [
    {x: 1076, y: 1096},
    {x: 91, y: 100},
  ]
]

export const graphics = new Graphics(document.body)
graphics.setup("/")
  .then(() => {
    const runtime = new Runtime()
    runtime.update = (dt) => {
    }
    runtime.draw = () => {
      graphics.clear({r: 0, g: 0, b: 0, a: 1})
      graphics.setTransformMatrix(Matrix.orthographic(300, 300))
      if (SPRITESHEET.complete) {
        const frame = Math.floor((runtime.timeElapsed() / 100) % frames.length)
        graphics.sprite(SPRITESHEET,
          ...frames[frame]
        )
      }
    }
    runtime.start()
  })
  .catch((err) => console.error(err))
