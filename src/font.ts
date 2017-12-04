import { Vector2 } from "./vector.js"

export interface FontFace {
  family: string,
  size: string,
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  style: "normal" | "oblique" | "italic",
  variant: string,
  color: string,
}

export const ENGLISH = [
  " ",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  ")", "!", "@", "#", "$", "%", "^", "&", "*", "(",
  "-", "=", "[", "]", ";", "'", ",", ".", "/", "`", "\\",
  "_", "+", "{", "}", ":", "\"", "<", ">", "?", "~", "|",
]

export interface Glyph {
  /*INFO(danny):
    character: the letter represented ex "a" "j" " "
    origin: the beginning of the letter's baseline
    position: location of sprite in spritesheet
    size: the bounding box of the sprite
    spacing - distance from origin to the next letter
  */
  character: string,
  origin: Vector2,
  position: Vector2,
  size: Vector2,
  spacing: number,
}

export interface Font {
  imageData: ImageData,
  glyphs: {
    [key: string]: Glyph,
  }
}

export function createFont (
  font: FontFace,
  characters: string[],
) : Font
{
  const el = document.createElement(`div`)
  el.style.fontSize = font.size
  document.body.appendChild(el)
  const sizeInPx = parseInt(getComputedStyle(el).fontSize!)
  document.body.removeChild(el)
  const glyphs = characters.map(c => createGlyph(font, c, sizeInPx))
  const canvas = document.createElement(`canvas`)
  if (false) {
    // @ts-ignore: Unreachable code error
    document.body.appendChild(canvas)
  }
  canvas.height = glyphs.reduce((h,[g, _]) => g.size.y > h ? g.size.y : h, 0)
  canvas.width = glyphs.reduce((w,[g, _]) => g.size.x + w, 0)
  const context = canvas.getContext(`2d`)!
  let offsetX = 0
  glyphs.forEach(([g, imageData]) => {
    context.putImageData(imageData, offsetX, 0)
    g.position.x = offsetX
    offsetX += g.size.x
  })
  return {
    imageData: context.getImageData(0, 0, canvas.width, canvas.height),
    glyphs: glyphs.reduce((gs: {[key: string]: Glyph}, [g,_]) => {
      gs[g.character] = g
      return gs
    }, {})
  }
}
function createGlyph (
  font: FontFace,
  character: string,
  sizeInPx: number,
) : [Glyph, ImageData]
{
  const width = sizeInPx * 1.3
  const height = sizeInPx * 1
  const canvas = document.createElement(`canvas`)
  canvas.width = width
  canvas.height = height
  const origin : Vector2 = {
    x: width / 3,
    y: height * 2 / 3,
  }
  const context = canvas.getContext(`2d`)!
  context.font = `${font.style || "normal"} ${font.variant || "normal"} ${font.weight || 400} ${font.size} "${font.family}"`
  context.fillStyle = font.color
  if (character === ` `) {
    const spacing = Math.ceil(sizeInPx / 3)
    return [
      {
        character,
        origin: {x: 0, y: 0},
        size: {x: spacing, y: 1},
        position: {x: 0, y: 0},
        spacing,
      },
      context.createImageData(spacing, 1),
    ]
  }
  context.fillText(character, origin.x, origin.y)
  const spacing = context.measureText(character).width
  const imageData = context.getImageData(0, 0, width, height)
  const l = getLeftBound(imageData)
  const r = getRightBound(imageData)
  const t = getTopBound(imageData)
  const b = getBottomBound(imageData)
  const glyphImageData = context.getImageData(l, t, r-l, b-t)
  if (false) {
    // @ts-ignore: Unreachable code error
    document.body.appendChild(canvas)
    context.strokeStyle = "hsla(0, 100%, 50%, 0.5)"
    context.setLineDash([5, 5]);
    context.beginPath()
    context.moveTo(origin.x, 0)
    context.lineTo(origin.x, height)
    context.stroke()
    context.beginPath()
    context.moveTo(0, origin.y)
    context.lineTo(width, origin.y)
    context.stroke()
    context.beginPath()
    context.strokeStyle = "hsla(140, 100%, 50%, 0.5)"
    context.moveTo(origin.x + spacing, 0)
    context.lineTo(origin.x + spacing, height)
    context.stroke()
    context.strokeStyle = "hsla(240, 100%, 50%, 0.5)"
    context.setLineDash([5, 0]);
    context.beginPath()
    context.moveTo(l, t)
    context.lineTo(r, t)
    context.lineTo(r, b)
    context.lineTo(l, b)
    context.lineTo(l, t)
    context.stroke()
  }
  return [
    {
      character,
      origin: {x: l - origin.x, y: origin.y - b},
      size: {x: r - l, y: b - t},
      position: {x: 0, y: 0},
      spacing,
    },
    glyphImageData,
  ]
}
function getLeftBound(
  imageData: ImageData
) : number
{
  const width = imageData.width
  const height = imageData.height
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      const a = imageData.data[(x + y * width) * 4 + 3]
      if (a > 0) {
        return x - 2
      }
    }
  }
  return -1
}
function getRightBound(
  imageData: ImageData
) : number
{
  const width = imageData.width
  const height = imageData.height
  for (var x = width-1; x >= 0; x--) {
    for (var y = 0; y < height; y++) {
      const a = imageData.data[(x + y * width) * 4 + 3]
      if (a > 0) {
        return x + 2
      }
    }
  }
  return -1
}
function getTopBound(
  imageData: ImageData
) : number
{
  const width = imageData.width
  const height = imageData.height
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      const a = imageData.data[(x + y * width) * 4 + 3]
      if (a > 0) {
        return y - 2
      }
    }
  }
  return -1
}
function getBottomBound(
  imageData: ImageData
) : number
{
  const width = imageData.width
  const height = imageData.height
  for (var y = height - 1; y >= 0; y--) {
    for (var x = 0; x < width; x++) {
      const a = imageData.data[(x + y * width) * 4 + 3]
      if (a > 0) {
        return y + 2
      }
    }
  }
  return -1
}
