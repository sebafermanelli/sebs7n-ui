"use client"

import * as React from "react"

/**
 * Los textos que los componentes escriben solos.
 *
 * Son los que no vienen del llamador: el nombre del botón de cerrar un diálogo,
 * «Sin resultados» de un combobox, «Ir al contenido» del skip link. Están en
 * español porque el sistema se escribió en español, y hasta ahora eso era el
 * final de la historia: tres de ellos —el «Cerrar» de Dialog, Sheet y Drawer—
 * no se podían cambiar de ninguna forma.
 *
 * Un `LabelsProvider` arriba del árbol los cambia todos de una vez. La prop
 * `labels` de cada componente sigue existiendo y le gana al provider: es para
 * el caso puntual —«Quitar del carrito» en vez de «Quitar»—, no para traducir.
 *
 * ```tsx
 * import { LabelsProvider, defaultLabels } from "sebs7n-ui/labels"
 *
 * const en = { ...defaultLabels, dialog: { close: "Close" }, … }
 *
 * <LabelsProvider value={en}>
 *   <App />
 * </LabelsProvider>
 * ```
 *
 * `defaultLabels` está tipado como `Labels` completo, así que armar una
 * traducción con `{ ...defaultLabels, ...en }` deja que TypeScript marque lo que
 * falte en `en` en vez de que aparezca en español en producción.
 *
 * **Faltan cuatro componentes a propósito**: `Breadcrumb`, `Pagination`, `Tag` y
 * `PageHeader` no leen del provider, porque leerlo pide un contexto de React y
 * eso los convertiría en componentes de cliente. Los cuatro están hoy en la
 * lista de los que se pueden renderizar en un Server Component, y eso vale más
 * que la comodidad: sus textos se pasan por prop (`ellipsisLabel`,
 * `removeLabel`, `breadcrumbLabel`, `labels`, `aria-label`), que es como venían.
 */
export type Labels = {
  appShell: {
    /** Nombre del botón hamburguesa en mobile. */
    openMenu: string
    /** Nombre del `<nav>` que envuelve al sidebar en el Sheet mobile. */
    navigation: string
    /** Texto del skip link, la primera parada de tabulación de la app. */
    skipToContent: string
  }
  autocomplete: {
    /** Nombre del botón que borra lo tipeado. */
    clear: string
    /** Nombre del botón que abre la lista. */
    trigger: string
  }
  combobox: {
    clear: string
    trigger: string
    /** Fila con spinner mientras una búsqueda async está en curso. */
    loading: string
    /** Lo que dice la lista cuando no hay resultados. */
    empty: string
    /** Prefijo del nombre del botón de quitar un chip: «Quitar Chile». */
    remove: string
  }
  dialog: {
    /** Nombre del botón X. */
    close: string
  }
  drawer: { close: string }
  numberField: {
    decrement: string
    increment: string
    /** `aria-roledescription` del campo: lo que el lector dice en vez de «campo de texto». */
    roleDescription: string
  }
  sheet: { close: string }
  sidebar: {
    /** Nombre del `<nav>` del sidebar. */
    nav: string
    /** Placeholder del buscador del sidebar. */
    search: string
  }
  themeSwitcher: {
    /** Nombre del grupo de opciones. */
    group: string
    light: string
    dark: string
    system: string
  }
  userMenu: {
    /** Encabezado de la sección de tema adentro del menú. */
    theme: string
  }
}

export const defaultLabels: Labels = {
  appShell: {
    openMenu: "Abrir menú",
    navigation: "Navegación",
    skipToContent: "Ir al contenido",
  },
  autocomplete: {
    clear: "Limpiar",
    trigger: "Ver sugerencias",
  },
  combobox: {
    clear: "Limpiar",
    trigger: "Abrir lista",
    loading: "Buscando…",
    empty: "Sin resultados",
    remove: "Quitar",
  },
  dialog: { close: "Cerrar" },
  drawer: { close: "Cerrar" },
  numberField: {
    decrement: "Disminuir",
    increment: "Aumentar",
    roleDescription: "Campo numérico",
  },
  sheet: { close: "Cerrar" },
  sidebar: {
    nav: "Navegación principal",
    search: "Buscar…",
  },
  themeSwitcher: {
    group: "Tema",
    light: "Tema claro",
    dark: "Tema oscuro",
    system: "Tema del sistema",
  },
  userMenu: { theme: "Tema" },
}

/** Una traducción parcial: se puede traducir un grupo, o una sola clave de un grupo. */
export type PartialLabels = { [G in keyof Labels]?: Partial<Labels[G]> }

const LabelsContext = React.createContext<Labels>(defaultLabels)

/**
 * Mezcla de dos niveles, que son los que tiene la forma: grupo y clave.
 *
 * No es un deep merge genérico a propósito. Uno genérico tendría que decidir
 * qué hace con arrays y con `null`, y acá no hay ni uno ni otro: son strings.
 */
function mezclar(base: Labels, encima: PartialLabels | undefined): Labels {
  if (!encima) return base
  const salida: Record<string, unknown> = { ...base }
  for (const grupo of Object.keys(encima) as (keyof Labels)[]) {
    const parcial = encima[grupo]
    if (parcial) salida[grupo] = { ...base[grupo], ...parcial }
  }
  // El `as` es porque TypeScript no puede seguir que cada grupo se mezcló contra
  // el suyo: el índice `grupo` es la unión de todas las claves y el valor, la
  // unión de todos los grupos. La garantía la da el loop, no el tipo.
  return salida as Labels
}

/**
 * Cambia los textos internos de todos los componentes que estén abajo.
 *
 * Anidados se suman: un provider adentro de otro mezcla sobre lo que ya había,
 * no sobre los textos en español. Sirve para una sección en otro idioma sin
 * repetir la traducción entera.
 */
export function LabelsProvider({ value, children }: { value?: PartialLabels; children?: React.ReactNode }) {
  const heredado = React.useContext(LabelsContext)
  const mezclado = React.useMemo(() => mezclar(heredado, value), [heredado, value])
  return <LabelsContext.Provider value={mezclado}>{children}</LabelsContext.Provider>
}

/**
 * Los textos que corresponden en este punto del árbol. Sin provider arriba,
 * `defaultLabels`.
 */
export function useLabels(): Labels {
  return React.useContext(LabelsContext)
}
