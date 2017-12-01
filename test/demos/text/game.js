import Graphics, { ENGLISH } from "/graphics.js"
import Matrix from "/matrix.js"

const screen = {x: 455, y: 76}
export const graphics = new Graphics(document.body, screen)

document.fonts.load(`1em "Lobster"`)
  .then(() => {
    graphics.setup("/")
      .then(() => {
        graphics.setTransformMatrix(Matrix.orthographic(screen))
        graphics.clear({r: 0, g: 0, b: 0, a: 1})
        console.time("font")
        const font = graphics.createFont(
          {
            family: "Lobster",
            weight: 400,
            size: "7em",
            color: "hsla(0, 100%, 50%, 1)",
          },
          ENGLISH,
        )
        graphics.text(font, "Hello Nuthatch!", {x: 10, y: 10})
        console.timeEnd("font")
      })
      .catch((err) => console.error(err))
  })
