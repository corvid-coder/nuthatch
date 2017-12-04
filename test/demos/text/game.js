import Graphics from "/graphics.js"
import { createFont, ENGLISH } from "/font.js"
import Matrix from "/matrix.js"

const screen = {x: 550, y: 200}
export const graphics = new Graphics(document.body, screen)

Promise.all([
  document.fonts.load(`1em "Lobster"`),
  document.fonts.load(`1em "Abril Fatface"`),
])
  .then(() => {
    graphics.setup("/")
      .then(() => {
        graphics.setTransformMatrix(Matrix.orthographic(screen))
        graphics.clear({r: 0, g: 0, b: 0, a: 1})
        console.time("font")
        const font = createFont(
          {
            family: "Abril Fatface",
            weight: 400,
            size: "7em",
            color: "hsla(220, 60%, 60%, 1.0)",
          },
          ENGLISH,
        )
        const font2 = createFont(
          {
            family: "Lobster",
            weight: 400,
            size: "7em",
            color: "hsla(0, 100%, 50%, 1)",
          },
          ENGLISH,
        )
        console.timeEnd("font")
        console.time("render")
        graphics.setColor({r: 1.0, g: 0, b: 0, a: 1.0})
        graphics.line([{x: 0, y: 100}, {x: screen.x, y: 100}])
        graphics.text(font2, "fjord?.=/\\", {x: 20, y: 100})
        graphics.setColor({r: 0.4, g: 0.5, b: 1.0, a: 1.0})
        graphics.line([{x: 0, y: 20}, {x: screen.x, y: 20}])
        graphics.text(font, "Hello Nuthatch!", {x: 0, y: 20})
        console.timeEnd("render")
      })
      .catch((err) => console.error(err))
  })
