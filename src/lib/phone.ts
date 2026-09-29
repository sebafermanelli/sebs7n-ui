// Teléfonos en E.164 («+5491155552002»: «+», código de país y número, sin espacios) sin
// libphonenumber. Valida el **largo** del número por país, no el tipo de línea ni el formato local:
// para eso haría falta la librería entera (~145 kB), y lo que las apps necesitan es no guardar un
// número con un dígito de menos. Sin `"use client"`: `isValidPhone` sirve en una Server Action.
//
// Solo por subpath (`sebs7n-ui/lib/phone`): no entra al barrel por peso.

/** Un país de la tabla: su código ISO, su código de discado y el largo del número nacional. */
export type PhoneCountry = {
  /** ISO 3166-1 alfa-2 («AR»). */
  code: string
  /** El código de discado, sin «+» («54»). */
  dial: string
  /** Cuántos dígitos puede tener el número sin el código de país, fijo o móvil. */
  min: number
  max: number
}

/**
 * Los largos son los de fijo y móvil de la metadata de libphonenumber-js 1.12.41 (`possibleLengths`
 * de `fixedLine` y `mobile`), sin los de números especiales (gratuitos, premium). Argentina y Brasil
 * llegan a 11 con el 9 del celular; Italia va de 6 a 12 porque el fijo conserva su 0.
 *
 * Con el mismo código de discado, el primero es el que se toma cuando no hay país preferido
 * (+1 → Estados Unidos).
 */
const TABLE: [code: string, dial: string, min: number, max: number][] = [
  ["US", "1", 10, 10],
  ["CA", "1", 10, 10],
  ["DO", "1", 10, 10],
  ["PR", "1", 10, 10],
  ["ZA", "27", 5, 9],
  ["GR", "30", 10, 10],
  ["NL", "31", 9, 11],
  ["BE", "32", 8, 9],
  ["FR", "33", 9, 9],
  ["ES", "34", 9, 9],
  ["IT", "39", 6, 12],
  ["CH", "41", 9, 9],
  ["AT", "43", 4, 13],
  ["GB", "44", 9, 10],
  ["DK", "45", 8, 8],
  ["SE", "46", 7, 9],
  ["NO", "47", 8, 8],
  ["PL", "48", 7, 9],
  ["DE", "49", 5, 15],
  ["PE", "51", 8, 9],
  ["MX", "52", 10, 10],
  ["AR", "54", 10, 11],
  ["BR", "55", 10, 11],
  ["CL", "56", 9, 9],
  ["CO", "57", 8, 10],
  ["VE", "58", 10, 10],
  ["AU", "61", 9, 9],
  ["NZ", "64", 8, 10],
  ["JP", "81", 9, 10],
  ["KR", "82", 5, 10],
  ["CN", "86", 7, 11],
  ["IN", "91", 10, 10],
  ["PT", "351", 9, 9],
  ["IE", "353", 7, 10],
  ["GT", "502", 8, 8],
  ["SV", "503", 8, 8],
  ["HN", "504", 8, 8],
  ["NI", "505", 8, 8],
  ["CR", "506", 8, 8],
  ["PA", "507", 7, 8],
  ["BO", "591", 8, 8],
  ["EC", "593", 8, 9],
  ["PY", "595", 7, 9],
  ["UY", "598", 8, 8],
  ["IL", "972", 8, 12],
]

/** Los países con código de discado, en el orden de la tabla. */
export const PHONE_COUNTRIES: readonly PhoneCountry[] = TABLE.map(([code, dial, min, max]) => ({ code, dial, min, max }))

/** El país de la tabla con ese código ISO, o `undefined`. */
export const phoneCountry = (code: string) => PHONE_COUNTRIES.find((country) => country.code === code.toUpperCase())

/** Solo los dígitos. */
export const onlyDigits = (text: string) => text.replace(/\D/g, "")

/** El E.164 de un número nacional: «+» + código + número; vacío sin número. */
export const toE164 = (country: PhoneCountry, national: string) => (national ? `+${country.dial}${onlyDigits(national)}` : "")

/**
 * Separa un E.164 en país y número nacional, por el código de discado más largo que coincida. Con
 * un código compartido (+1), gana `preferred` si es uno de ellos. `null` si no empieza con «+» o
 * el código no está en la tabla. Espacios, guiones y paréntesis se ignoran.
 */
export function parsePhone(value: string, preferred?: string): { country: PhoneCountry; national: string } | null {
  if (!value.trim().startsWith("+")) return null
  const digits = onlyDigits(value)
  const matches = PHONE_COUNTRIES.filter((country) => digits.startsWith(country.dial))
  if (!matches.length) return null
  const longest = Math.max(...matches.map((country) => country.dial.length))
  const candidates = matches.filter((country) => country.dial.length === longest)
  const country = candidates.find((candidate) => candidate.code === preferred?.toUpperCase()) ?? candidates[0]!
  return { country, national: digits.slice(country.dial.length) }
}

/**
 * ¿Es un teléfono E.164 con un largo posible para su país? Solo mira el largo: «+54 11 5555 2002»
 * sí, «+54 11 5555 200» no. `country` desempata un código compartido (+1).
 */
export function isValidPhone(value: string, country?: string): boolean {
  const phone = parsePhone(value, country)
  if (!phone) return false
  return phone.national.length >= phone.country.min && phone.national.length <= phone.country.max
}
