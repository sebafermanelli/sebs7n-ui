import type { Block } from "../_data/posts"

/** `YYYY-MM-DD` se lee como fecha local, no UTC: «2026-09-18» no puede mostrarse como el 17. */
const parse = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year!, month! - 1, day)
}

export const formatDate = (iso: string) => parse(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

/** «21 sep 2026»: la fecha corta de una lista. Los meses van a mano: `Intl` escribe «sept» y cambia entre motores. */
export const formatDateShort = (iso: string) => {
  const date = parse(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

const WORDS_PER_MINUTE = 200

const textOf = (block: Block) => {
  switch (block.type) {
    case "list":
      return block.items.join(" ")
    case "code":
      return ""
    default:
      return block.text
  }
}

/** Minutos de lectura, redondeados para arriba; el código no cuenta. */
export function readingTime(blocks: Block[]) {
  const words = blocks.map(textOf).join(" ").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
