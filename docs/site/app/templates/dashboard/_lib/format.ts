// Formatos del template, en un solo lugar: la tabla, el detalle, Inicio y Clientes muestran lo mismo.

export const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" })

const shortDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" })

/** Las fechas del mock son `YYYY-MM-DD` locales: con `new Date(iso)` serían UTC y en Argentina darían el día anterior. */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return shortDate.format(new Date(y!, m! - 1, d))
}

/** Hoy en `YYYY-MM-DD` local: `toISOString()` da la de UTC, que después de las 21 ya es mañana. */
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
