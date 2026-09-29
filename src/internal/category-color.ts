import type { BadgeColor } from "../variants/badge.js"

/**
 * Los colores de categoría de iCloud (catálogo §1.4: el punto de una fila, un evento del
 * calendario, un segmento de la barra de almacenamiento), con la paleta de `Badge`.
 *
 * Clases literales y no `bg-${color}-700`: Tailwind lee el `dist` como texto, y una clase armada
 * en tiempo de ejecución no la encuentra.
 */
export const categoryFill: Record<BadgeColor, string> = {
  gray: "bg-gray-700",
  brand: "bg-brand-700",
  red: "bg-red-700",
  amber: "bg-amber-700",
  green: "bg-green-700",
  blue: "bg-blue-700",
  teal: "bg-teal-700",
  purple: "bg-purple-700",
  pink: "bg-pink-700",
}

/** El chip de un evento: el color al 20 %, el borde izquierdo en el color y el texto en su tinta. */
export const categoryChip: Record<BadgeColor, string> = {
  gray: "bg-gray-700/20 border-gray-700 text-label",
  brand: "bg-brand-700/20 border-brand-700 text-brand-ink",
  red: "bg-red-700/20 border-red-700 text-red-ink",
  amber: "bg-amber-700/20 border-amber-700 text-amber-ink",
  green: "bg-green-700/20 border-green-700 text-green-ink",
  blue: "bg-blue-700/20 border-blue-700 text-blue-ink",
  teal: "bg-teal-700/20 border-teal-700 text-teal-ink",
  purple: "bg-purple-700/20 border-purple-700 text-purple-ink",
  pink: "bg-pink-700/20 border-pink-700 text-pink-ink",
}
