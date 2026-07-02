// Dependency-free PNG icon generator for Daily Kids Games.
// Renders an indigo tile with a 2x2 grid of game-colored rounded squares
// and writes the PWA icons into public/.
//
// Usage: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// --- minimal PNG encoder ----------------------------------------------------
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  // raw scanlines, each prefixed with filter byte 0
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- icon rendering ---------------------------------------------------------
const BG = [0x63, 0x66, 0xf1] // indigo-500 (manifest theme color)
const TILES = [
  [0xf8, 0x71, 0x71], // red-400
  [0x60, 0xa5, 0xfa], // blue-400
  [0xfd, 0xe0, 0x47], // yellow-300
  [0x4a, 0xde, 0x80], // green-400
]

// signed distance to a rounded rectangle centered at (cx, cy)
function roundedRectSDF(px, py, cx, cy, halfW, halfH, radius) {
  const qx = Math.abs(px - cx) - (halfW - radius)
  const qy = Math.abs(py - cy) - (halfH - radius)
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - radius
}

function render(size) {
  const rgba = Buffer.alloc(size * size * 4)
  // layout: 2x2 tiles inside a padded area
  const pad = size * 0.18 // outer padding (keeps art inside maskable safe zone)
  const gap = size * 0.05 // gap between tiles
  const tile = (size - 2 * pad - gap) / 2
  const tileR = tile * 0.22 // tile corner radius
  const centers = [
    [pad + tile / 2, pad + tile / 2],
    [pad + tile + gap + tile / 2, pad + tile / 2],
    [pad + tile / 2, pad + tile + gap + tile / 2],
    [pad + tile + gap + tile / 2, pad + tile + gap + tile / 2],
  ]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let [r, g, b] = BG
      // full-bleed background (required for maskable); draw tiles on top
      for (let t = 0; t < 4; t++) {
        const [cx, cy] = centers[t]
        const d = roundedRectSDF(x + 0.5, y + 0.5, cx, cy, tile / 2, tile / 2, tileR)
        if (d < 0.5) {
          // 1px antialiased edge between tile color and background
          const a = Math.min(1, 0.5 - d)
          const [tr, tg, tb] = TILES[t]
          r = Math.round(tr * a + r * (1 - a))
          g = Math.round(tg * a + g * (1 - a))
          b = Math.round(tb * a + b * (1 - a))
          break
        }
      }
      const i = (y * size + x) * 4
      rgba[i] = r
      rgba[i + 1] = g
      rgba[i + 2] = b
      rgba[i + 3] = 255
    }
  }
  return encodePNG(size, size, rgba)
}

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
writeFileSync(join(publicDir, 'icon-512.png'), render(512))
writeFileSync(join(publicDir, 'icon-192.png'), render(192))
writeFileSync(join(publicDir, 'apple-touch-icon.png'), render(180))
console.log('wrote icon-512.png, icon-192.png, apple-touch-icon.png to', publicDir)
