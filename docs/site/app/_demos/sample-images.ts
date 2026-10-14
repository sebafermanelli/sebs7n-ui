// Imágenes de muestra para las demos de recorte, generadas en el navegador con un canvas: no dependen de
// ningún archivo y la cuadrícula numerada deja ver qué zona queda dentro del marco.

/** Una cuadrícula de celdas de 100 px con su nombre (A1, B1…), colores por celda y una cruz en el centro. */
export async function gridFile(width: number, height: number, name: string): Promise<File> {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")!
  const cell = 100
  const columns = Math.ceil(width / cell)
  const rows = Math.ceil(height / cell)
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      context.fillStyle = `hsl(${((column * 360) / columns + row * 24) % 360} 55% ${(column + row) % 2 ? 58 : 66}%)`
      context.fillRect(column * cell, row * cell, cell, cell)
      context.fillStyle = "rgb(20 28 48 / 0.85)"
      context.font = "600 26px system-ui, sans-serif"
      context.textBaseline = "top"
      context.fillText(`${String.fromCharCode(65 + (column % 26))}${row + 1}`, column * cell + 10, row * cell + 10)
    }
  }
  context.strokeStyle = "rgb(20 28 48 / 0.9)"
  context.lineWidth = 6
  context.strokeRect(3, 3, width - 6, height - 6)
  context.beginPath()
  context.moveTo(width / 2 - 40, height / 2)
  context.lineTo(width / 2 + 40, height / 2)
  context.moveTo(width / 2, height / 2 - 40)
  context.lineTo(width / 2, height / 2 + 40)
  context.stroke()
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((made) => (made ? resolve(made) : reject(new Error("canvas"))), "image/png"))
  return new File([blob], name, { type: "image/png" })
}

/** Un logo apaisado (4:1) con fondo transparente, para probar «ver la imagen entera». */
export async function logoFile(name = "logo.png"): Promise<File> {
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  canvas.height = 300
  const context = canvas.getContext("2d")!
  context.fillStyle = "#2b7fff"
  context.beginPath()
  context.roundRect(0, 0, 300, 300, 66)
  context.fill()
  context.fillStyle = "#fff"
  context.font = "700 190px system-ui, sans-serif"
  context.textBaseline = "middle"
  context.textAlign = "center"
  context.fillText("E", 150, 160)
  context.fillStyle = "#6f7fa6"
  context.textAlign = "start"
  context.font = "700 150px system-ui, sans-serif"
  context.fillText("Estudio", 340, 160)
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((made) => (made ? resolve(made) : reject(new Error("canvas"))), "image/png"))
  return new File([blob], name, { type: "image/png" })
}

/** Un archivo que dice ser PNG y no lo es: el recorte no lo puede leer. */
export const brokenFile = () => new File([new Uint8Array(64).fill(7)], "damaged.png", { type: "image/png" })
