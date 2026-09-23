// Tipos del extractor de props. El módulo es .mjs (corre con node, sin build),
// igual que scripts/gen-colors.mjs del paquete.

export type PropDoc = {
  name: string
  type: string
  required: boolean
  /** El inicializador del patrón de desestructuración, tal como está escrito. */
  default: string | null
  description: string
}

export type ExportDoc = {
  name: string
  description: string
  /** De qué hereda: `<div>`, `Menu.Popup`, … */
  bases: string[]
  /** Si el componente es un alias directo de un primitivo, su expresión. */
  alias: string | null
  props: PropDoc[]
}

export function basesFromTypeText(text: string): string[]
export function cleanTypeText(text: string): string
export function extractProps(options: { root: string; files: string[] }): Map<string, ExportDoc[]>
export function componentSlugs(root: string): string[]
