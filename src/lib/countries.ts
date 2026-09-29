// Países por su código ISO 3166-1 alfa-2, sin nombres escritos a mano: los nombres salen de
// `Intl.DisplayNames` en el idioma que se pida, y la bandera se arma con el código. Sin
// `"use client"`: se puede usar en el servidor (validar un `country` que llega en un form).
//
// Solo por subpath (`sebs7n-ui/lib/countries`), como `lib/phone`: no entra al barrel por peso.

/**
 * Los 249 códigos asignados de ISO 3166-1 alfa-2, en orden alfabético y pegados de a dos letras
 * (un string ocupa menos que un array en el bundle). Sin los reservados ni los retirados (`UK`,
 * `EU`, `XK`, `AN`…).
 */
const CODES =
  "ADAEAFAGAIALAMAOAQARASATAUAWAXAZBABBBDBEBFBGBHBIBJBLBMBNBOBQBRBSBTBVBWBYBZCACCCDCFCGCHCICKCLCMCNCOCRCUCVCWCXCYCZDEDJDKDMDODZECEEEGEHERESETFIFJFKFMFOFRGAGBGDGEGFGGGHGIGLGMGNGPGQGRGSGTGUGWGYHKHMHNHRHTHUIDIEILIMINIOIQIRISITJEJMJOJPKEKGKHKIKMKNKPKRKWKYKZLALBLCLILKLRLSLTLULVLYMAMCMDMEMFMGMHMKMLMMMNMOMPMQMRMSMTMUMVMWMXMYMZNANCNENFNGNINLNONPNRNUNZOMPAPEPFPGPHPKPLPMPNPRPSPTPWPYQARERORSRURWSASBSCSDSESGSHSISJSKSLSMSNSOSRSSSTSVSXSYSZTCTDTFTGTHTJTKTLTMTNTOTRTTTVTWTZUAUGUMUSUYUZVAVCVEVGVIVNVUWFWSYEYTZAZMZW"

/** Los códigos de país, ISO 3166-1 alfa-2 en mayúsculas. */
export const COUNTRY_CODES: readonly string[] = CODES.match(/../g)!

/** ¿Es un código de país asignado? Mayúsculas o minúsculas. */
export const isCountryCode = (code: string) => /^[a-z]{2}$/i.test(code) && COUNTRY_CODES.includes(code.toUpperCase())

/**
 * La bandera de un país como emoji, armada con las dos letras del código (los «regional indicator
 * symbols»). No es una imagen: Windows no dibuja estas banderas y muestra las dos letras («AR»).
 */
export function countryFlag(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65))
}

/** El nombre del país en `locale` («Argentina», «Brasil»); el código si el entorno no lo conoce. */
export function countryName(code: string, locale: string): string {
  return new Intl.DisplayNames([locale], { type: "region", fallback: "code" }).of(code.toUpperCase()) ?? code
}
