/**
 * El nombre accesible del botón de quitar de un `Tag` o de un `ComboboxChip`.
 *
 * El label venía siendo un **prefijo**: «Quitar» + el dato, que da «Quitar Chile». Funciona en
 * español, inglés y portugués, y en ningún idioma donde el verbo no vaya adelante: en alemán es
 * «Chile entfernen», y no hay prefijo que lo arme. Como plantilla —una función que recibe el
 * nombre y devuelve la frase entera— sí sale, y es lo que ya hacía `labels.page` de `Pagination`.
 *
 * El string sigue andando igual y es lo que corresponde para el 90 % de los casos: nadie que
 * escriba en español tiene que escribir una función para decir «Quitar».
 *
 * Vive en `internal/` porque no es una utilidad que alguien quiera importar: es el detalle que
 * `Tag` y `ComboboxChip` comparten, y estaba a punto de quedar copiado en los dos. `lib/*` es un
 * subpath público; `internal/*` no está en el `exports` del paquete.
 *
 * Sin `"use client"` a propósito: `Tag` se puede renderizar en un Server Component, y la
 * directiva contagia a todo el que importe el módulo.
 */

/** Un prefijo («Quitar», que se pega adelante del dato) o la frase entera, armada con el dato. */
export type RemoveLabel = string | ((name: string) => string)

/**
 * `name` es el texto del tag, cuando se lo pudo sacar de `children` o de `textValue`. Sin nombre,
 * el prefijo queda solo («Quitar») y la plantilla se llama con la cadena vacía, así que
 * «{name} entfernen» da «entfernen» y no « entfernen».
 */
export function nombreDeQuitar(label: RemoveLabel, name: string | undefined): string {
  if (typeof label === "function") return label(name ?? "").trim()
  return name ? `${label} ${name}` : label
}
