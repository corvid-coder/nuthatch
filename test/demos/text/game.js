import Graphics, { ENGLISH } from "/graphics.js"
import Matrix from "/matrix.js"

export const graphics = new Graphics(document.body)

graphics.setup("/")
  .then(() => {
    graphics.setTransformMatrix(Matrix.orthographic(300, 300))
    graphics.clear({r: 0, g: 0, b: 0, a: 1})
    // font-family: 'Abril Fatface', cursive;
    console.time("font")
    const font = graphics.createFont(
      {
        family: "Abril Fatface",
        weight: 400,
        size: "7em",
      },
      ENGLISH,
    )
    graphics.text(font, "Hello Nuthatch!", {x: 0, y: 0})
    console.timeEnd("font")
  })
  .catch((err) => console.error(err))
