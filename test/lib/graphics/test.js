import Graphics from "/graphics.js"
import Matrix from "/matrix.js"

const image = new Image()
const spritesheet = new Image()

const graphics = new Graphics()
graphics.setup("/")
  .then(() => {
    graphics.clear({r: 0, g: 0, b: 0, a: 1})
    graphics.setColor({r: 1, g: 1, b: 0, a: 1})
    graphics.rectangle(
      {x: -1, y: 0},
      {x: 1, y: 1},
    )
    graphics.setColor({r: 0, g: 1, b: 1, a: 1})
    graphics.triangle(
      {x: -1,   y:  0},
      {x:  0,   y:  0},
      {x: -0.5, y: -1},
    )
    graphics.setColor({r: 0.5, g: 0.1, b: 1, a: 1})
    graphics.polygon(
      [
        {x: 1,   y:  0},
        {x: 0.5, y:  1},
        {x: 0,   y:  0},
        {x: 0,   y: -1},
        {x: 1,   y: -1},
      ]
    )
    graphics.setColor({r: 0, g: 1, b: 0, a: 0.4})
    graphics.circle(
      {x: 0, y: 0},
      0.5
    )
    graphics.setColor({r: 1, g: 0, b: 0, a: 1.0})
    graphics.circle(
      {x: -0.5, y: 0.5},
      0.25,
      6
    )
    graphics.setColor({r: 1, g: 0, b: 0, a: 1})
    graphics.circle(
      {x: 0.5, y: -0.5},
      0.25,
      6
    )
    
    image.onload = () => {
      graphics.setTransformMatrix(Matrix.orthographic(300, 300))
      graphics.image(image)
    }
    image.src = "./parrot.png"
    
    
    spritesheet.onload = () => {
      graphics.setTransformMatrix(Matrix.orthographic(300, 300))
      graphics.setColor({r: 0.0, g: 0.0, b: 0.0, a: 1.0})
      graphics.sprite(spritesheet, {x: 533, y: 332}, {x: 116, y: 111})
    }
    spritesheet.src = "./spritesheet_objects.png"
  })
  .catch((err) => console.error(err))
