// Teléfonos en E.164 («+5491155552002»: «+», código de país y número, sin espacios) sin
// libphonenumber. Valida el **largo** del número por país, no el tipo de línea ni el formato local:
// para eso haría falta la librería entera (~145 kB), y lo que las apps necesitan es no guardar un
// número con un dígito de menos. Sin `"use client"`: `isValidPhone` sirve en una Server Action.
//
// Solo por subpath (`sebs7n-ui/lib/phone`): no entra al barrel por peso.

/**
 * Un país de la tabla: su código ISO, su código de discado, el largo del número nacional y el
 * prefijo nacional.
 */
export type PhoneCountry = {
  /** ISO 3166-1 alfa-2 («AR»). */
  code: string
  /** El código de discado, sin «+» («54»). */
  dial: string
  /** Cuántos dígitos puede tener el número sin el código de país, fijo o móvil. */
  min: number
  max: number
  /**
   * El prefijo nacional («trunk»): lo que se marca adelante dentro del país y no va en el E.164 (el
   * 0 de «011 5555 2002», el 1 de Estados Unidos). Vacío si el país no tiene: en Italia el 0 del
   * fijo es parte del número.
   */
  trunk: string
}

/**
 * Los largos son los de fijo y móvil de la metadata de libphonenumber-js 1.12.41 (`possibleLengths`
 * de `fixedLine` y `mobile`), sin los de números especiales (gratuitos, premium). Argentina y Brasil
 * llegan a 11 con el 9 del celular; Italia va de 6 a 12 porque el fijo conserva su 0.
 *
 * Con el mismo código de discado, el primero es el que se toma cuando no hay país preferido
 * (+1 → Estados Unidos).
 */
//
// El prefijo nacional es el `national_prefix` de la misma metadata. «0» es el de casi todos, «1» el
// de +1; sin prefijo: Grecia, España, Italia, Dinamarca, Noruega, Polonia, México (lo sacó en
// 2019), Chile, Portugal y Centroamérica.
const TABLE: [code: string, dial: string, min: number, max: number, trunk?: string][] = [
  ["US", "1", 10, 10, "1"],
  ["CA", "1", 10, 10, "1"],
  ["DO", "1", 10, 10, "1"],
  ["PR", "1", 10, 10, "1"],
  ["ZA", "27", 5, 9, "0"],
  ["GR", "30", 10, 10],
  ["NL", "31", 9, 11, "0"],
  ["BE", "32", 8, 9, "0"],
  ["FR", "33", 9, 9, "0"],
  ["ES", "34", 9, 9],
  ["IT", "39", 6, 12],
  ["CH", "41", 9, 9, "0"],
  ["AT", "43", 4, 13, "0"],
  ["GB", "44", 9, 10, "0"],
  ["DK", "45", 8, 8],
  ["SE", "46", 7, 9, "0"],
  ["NO", "47", 8, 8],
  ["PL", "48", 7, 9],
  ["DE", "49", 5, 15, "0"],
  ["PE", "51", 8, 9, "0"],
  ["MX", "52", 10, 10],
  ["AR", "54", 10, 11, "0"],
  ["BR", "55", 10, 11, "0"],
  ["CL", "56", 9, 9],
  ["CO", "57", 8, 10, "0"],
  ["VE", "58", 10, 10, "0"],
  ["AU", "61", 9, 9, "0"],
  ["NZ", "64", 8, 10, "0"],
  ["JP", "81", 9, 10, "0"],
  ["KR", "82", 5, 10, "0"],
  ["CN", "86", 7, 11, "0"],
  ["IN", "91", 10, 10, "0"],
  ["PT", "351", 9, 9],
  ["IE", "353", 7, 10, "0"],
  ["GT", "502", 8, 8],
  ["SV", "503", 8, 8],
  ["HN", "504", 8, 8],
  ["NI", "505", 8, 8],
  ["CR", "506", 8, 8],
  ["PA", "507", 7, 8],
  ["BO", "591", 8, 8, "0"],
  ["EC", "593", 8, 9, "0"],
  ["PY", "595", 7, 9, "0"],
  ["UY", "598", 8, 8, "0"],
  ["IL", "972", 8, 12, "0"],
]

/** Los países con código de discado, en el orden de la tabla. */
export const PHONE_COUNTRIES: readonly PhoneCountry[] = TABLE.map(([code, dial, min, max, trunk = ""]) => ({ code, dial, min, max, trunk }))

/** El país de la tabla con ese código ISO, o `undefined`. */
export const phoneCountry = (code: string) => PHONE_COUNTRIES.find((country) => country.code === code.toUpperCase())

/** Solo los dígitos. */
export const onlyDigits = (text: string) => text.replace(/\D/g, "")

/**
 * Los códigos de área de Argentina después de los que va el «15» del celular, del
 * `national_prefix_for_parsing` de AR en la metadata de libphonenumber-js 1.12.41. El número local
 * del celular es «0 + área + 15 + número»; el E.164 es «+54 9 + área + número».
 */
const AR_AREAS =
  /11|2(?:2(?:02?|[13]|2[13-79]|4[1-6]|5[2457]|6[124-8]|7[1-4]|8[13-6]|9[1267])|3(?:02?|1[467]|2[03-6]|3[13-8]|[49][2-6]|5[2-8]|[67])|4(?:7[3-578]|9)|6(?:[0136]|2[24-6]|4[6-8]?|5[15-8])|80|9(?:0[1-3]|[19]|2\d|3[1-6]|4[02568]?|5[2-4]|6[2-46]|72?|8[23]?))|3(?:3(?:2[79]|6|8[2578])|4(?:0[0-24-9]|[12]|3[5-8]?|4[24-7]|5[4-68]?|6[02-9]|7[126]|8[2379]?|9[1-36-8])|5(?:1|2[1245]|3[237]?|4[1-46-9]|6[2-4]|7[1-6]|8[2-5]?)|6[24]|7(?:[069]|1[1568]|2[15]|3[145]|4[13]|5[14-8]|7[2-57]|8[126])|8(?:[01]|2[15-7]|3[2578]?|4[13-6]|5[4-8]?|6[1-357-9]|7[36-8]?|8[5-8]?|9[124]))/.source
const AR_MOBILE = new RegExp(`^(${AR_AREAS})15`)
/**
 * Los formatos de Argentina, de `available_formats` de AR en la metadata de libphonenumber-js 1.12.41:
 * el patrón del número nacional, el último de sus `leading_digits` (el más preciso: el que decide si
 * el área tiene 2, 3 o 4 dígitos), el formato nacional con el prefijo («0$1» ya aplicado) y el
 * internacional. `AR_AREAS` de arriba no sirve para esto: es el de `national_prefix_for_parsing`, que
 * tomaba «3856» por un área cuando el área es «385» y el abonado «638-6236».
 */
const AR_FORMATS: [pattern: RegExp, leading: RegExp, national: string, international: string][] = [
  [
    /^(\d{4})(\d{2})(\d{4})$/,
    /^(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|58|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|54(?:4|5[13-7]|6[89])|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:454|85[56])[46]|3(?:4(?:36|5[56])|8(?:[38]5|76))[4-6])/,
    "0$1 $2-$3",
    "$1 $2-$3",
  ],
  [/^(\d{2})(\d{4})(\d{4})$/, /^1/, "0$1 $2-$3", "$1 $2-$3"],
  [/^(\d{3})(\d{3})(\d{4})$/, /^[68]/, "0$1-$2-$3", "$1-$2-$3"],
  [/^(\d{3})(\d{3})(\d{4})$/, /^[23]/, "0$1 $2-$3", "$1 $2-$3"],
  [
    /^(\d)(\d{4})(\d{2})(\d{4})$/,
    /^(?:9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|5(?:4(?:4|5[13-7]|6[89])|[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4(?:36|5[56])|8(?:[38]5|76))[4-6])/,
    "0$2 15-$3-$4",
    "$1 $2 $3-$4",
  ],
  [/^(\d)(\d{2})(\d{4})(\d{4})$/, /^91/, "0$2 15-$3-$4", "$1 $2 $3-$4"],
  [/^(\d{3})(\d{3})(\d{5})$/, /^8/, "0$1-$2-$3", "$1-$2-$3"],
  [/^(\d)(\d{3})(\d{3})(\d{4})$/, /^9/, "0$2 15-$3-$4", "$1 $2 $3-$4"],
]

/**
 * El número nacional como va en el E.164: solo dígitos y sin el prefijo nacional («011 5555 2002» →
 * «1155552002»). En Argentina, además, el celular escrito con el 15 pasa a la forma con 9
 * («11 15 5555 2002» → «91155552002»): con el 15 son 12 dígitos, que ningún número tiene, así que un
 * fijo cuyo número empieza con 15 no se toca.
 */
export function nationalNumber(country: PhoneCountry, text: string): string {
  let digits = onlyDigits(text)
  if (country.trunk && digits.startsWith(country.trunk)) digits = digits.slice(country.trunk.length)
  const mobile = country.code === "AR" && digits.length === 12 ? AR_MOBILE.exec(digits) : null
  return mobile ? `9${mobile[1]}${digits.slice(mobile[0].length)}` : digits
}

/** El E.164 de un número nacional: «+» + código + número sin prefijo nacional; vacío sin número. */
export function toE164(country: PhoneCountry, national: string): string {
  const digits = nationalNumber(country, national)
  return digits ? `+${country.dial}${digits}` : ""
}

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
 * ¿Es un teléfono E.164 con un largo posible para su país? Mira el largo y que el número no empiece
 * con el prefijo nacional: «+54 11 5555 2002» sí, «+54 11 5555 200» y «+54 011 5555 2002» no.
 * `country` desempata un código compartido (+1).
 */
export function isValidPhone(value: string, country?: string): boolean {
  const phone = parsePhone(value, country)
  if (!phone) return false
  const { national, country: { min, max, trunk } } = phone
  if (trunk && national.startsWith(trunk)) return false
  return national.length >= min && national.length <= max
}

/**
 * Los últimos cuatro juntos y el resto en grupos de tres **desde la derecha**; si adelante sobra un solo
 * dígito, se suma al grupo siguiente: «2025550143» → «202 555 0143», «99123456» → «9912 3456». Nunca un
 * grupo de un dígito («991 2 3456» era el de antes).
 */
function grouped(digits: string): string {
  if (digits.length <= 4) return digits
  const head = digits.slice(0, -4)
  const groups: string[] = []
  for (let end = head.length; end > 0; end -= 3) groups.unshift(head.slice(Math.max(0, end - 3), end))
  if (groups.length > 1 && groups[0]!.length === 1) groups.splice(0, 2, groups[0]! + groups[1]!)
  return [...groups, digits.slice(-4)].join(" ")
}

/**
 * Un E.164 para mostrar: internacional legible («+54 9 11 5555-2002») o, si el teléfono es argentino y
 * `country` es `"AR"` (el país de quien lo lee), nacional («011 15-5555-2002»).
 *
 * No es el formato oficial de cada país (eso es libphonenumber): Argentina va con sus códigos de área
 * y el 15 del celular; el resto, siempre internacional, en grupos desde la derecha con los últimos
 * cuatro juntos. El formato nacional solo existe donde hay un patrón definido (hoy, AR): inventarlo
 * para otros países daba grupos que nadie escribe. Lo que no es un teléfono válido (`isValidPhone`:
 * un E.164 de la tabla con el largo de su país) vuelve tal cual: los datos viejos y los números a
 * medio escribir se muestran sin romperse.
 */
export function formatPhone(value: string, options: { country?: string } = {}): string {
  if (!isValidPhone(value, options.country)) return value
  const phone = parsePhone(value, options.country)!
  const { country, national } = phone
  const local = options.country?.toUpperCase() === country.code
  if (country.code === "AR") {
    // El primero que calza, como libphonenumber: el patrón entero y el comienzo por `leading`.
    const format = AR_FORMATS.find(([pattern, leading]) => pattern.test(national) && leading.test(national))
    if (format) return local ? national.replace(format[0], format[2]) : `+54 ${national.replace(format[0], format[3])}`
  }
  return `+${country.dial} ${grouped(national)}`
}
