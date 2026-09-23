import type * as React from "react"

/**
 * El `render` del chevron que abre la lista en `Combobox` y `Autocomplete`.
 *
 * Base UI asume que el input vive **dentro** del popup hasta que el input se registra, y eso pasa
 * en un effect: el HTML que emite el server trae el chevron con `role="combobox"`, `tabindex="0"`
 * y el mismo `id` que el input. En estos dos wrappers el input siempre está afuera, así que los
 * atributos de ese caso se fijan acá y el HTML del server ya sale bien.
 *
 * Vive en `internal/` y no en `lib/`, que es lo que pedía la auditoría, porque `lib/*` es un
 * subpath público: esto no es una utilidad que alguien quiera importar, es el parche de un detalle
 * de Base UI que desaparece el día que el primitivo lo arregle. Estaba copiado literal en los dos
 * archivos, que es el problema que había que resolver.
 */
export const renderShellTrigger = (props: React.ComponentProps<"button">) => (
  <button {...props} id={undefined} role={undefined} tabIndex={-1} aria-haspopup="listbox" />
)
