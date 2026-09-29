/**
 * Las claves con valor, sin las que están en `undefined`. Para mezclar textos con spread: `{ ...a,
 * ...b }` copia también un `undefined` explícito (`labels={{ day: undefined }}`, o un provider que
 * arma el objeto con claves que su traducción no tiene) y borraba el texto por defecto.
 */
export function defined<T extends object>(value: T | undefined): Partial<T> {
  if (!value) return {}
  const out: Partial<T> = {}
  for (const key of Object.keys(value) as (keyof T)[]) if (value[key] !== undefined) out[key] = value[key]
  return out
}
