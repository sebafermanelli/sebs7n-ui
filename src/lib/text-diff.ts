/** Una parte de la comparación: igual en los dos textos, solo en el viejo (`delete`) o solo en el nuevo (`insert`). */
type TextDiffPart = { type: "equal" | "delete" | "insert"; value: string }

// Por encima de esto (palabras × palabras) la tabla de LCS ya no es barata en un render: se marca
// todo como reemplazado. Un párrafo largo contra otro ronda las 200 × 200 = 40 000 celdas.
const MAX_CELLS = 1_000_000

/**
 * Compara dos textos palabra por palabra (los espacios cuentan como parte, así se reconstruyen
 * exactos) y devuelve las partes iguales, quitadas y agregadas, con las contiguas juntas. Es la
 * subsecuencia común más larga: la lectura más corta de «qué cambió». Pura, sirve en el servidor.
 */
function diffWords(from: string, to: string): TextDiffPart[] {
  const a = from.split(/(\s+)/).filter(Boolean)
  const b = to.split(/(\s+)/).filter(Boolean)
  const out: TextDiffPart[] = []
  const push = (type: TextDiffPart["type"], value: string) => {
    const last = out.at(-1)
    if (last?.type === type) last.value += value
    else out.push({ type, value })
  }

  if (a.length * b.length > MAX_CELLS) {
    if (from) push("delete", from)
    if (to) push("insert", to)
    return out
  }

  // lcs[i][j] = largo de la subsecuencia común de a[i..] y b[j..]
  const lcs = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!)
    }
  }

  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push("equal", a[i]!)
      i++
      j++
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) push("delete", a[i++]!)
    else push("insert", b[j++]!)
  }
  while (i < a.length) push("delete", a[i++]!)
  while (j < b.length) push("insert", b[j++]!)
  return out
}

export { diffWords, type TextDiffPart }
