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
 * El `value` se puede armar en el render, que es lo que pasa con i18n:
 *
 * ```tsx
 * const t = useTranslations("ui")
 * <LabelsProvider value={{ dialog: { close: t("close") } }}>
 * ```
 *
 * El provider compara el contenido, no la identidad del objeto: un `value` nuevo
 * con los mismos textos no re-renderiza a nadie. El `useMemo` del lado del
 * llamador es opcional.
 *
 * **Faltan tres componentes a propósito**: `Breadcrumb`, `Pagination` y `Tag` no
 * leen del provider, porque leerlo pide un contexto de React y eso los
 * convertiría en componentes de cliente. Los tres están hoy en la lista de los
 * que se pueden renderizar en un Server Component, y eso vale más que la
 * comodidad: sus textos se pasan por prop (`ellipsisLabel`, `removeLabel`,
 * `labels`, `aria-label`), que es como venían.
 *
 * `PageHeader` estaba en esa lista hasta la 0.5.1 y salió: su `breadcrumbLabel`
 * era un `aria-label` con default en español, y en una app trilingüe 18 de 22
 * pantallas lo dejaban así sin que nadie se enterara —un `aria-label` mal no se
 * ve—. Sigue siendo Server Component: el `<nav>` de las migas se mudó a un
 * subcomponente de cliente (`internal/page-header-breadcrumb`) que sí lee el
 * provider, y un Server Component puede renderizar uno de cliente.
 *
 * **Pendiente para la próxima major:** esos sueltos —`ellipsisLabel` de
 * `Breadcrumb` y `Pagination`, `removeLabel` de `Tag`— tendrían
 * que pasar a un objeto `labels`, como los demás. Hoy conviven dos formas de decir
 * lo mismo. No se cambia acá porque renombrar una prop rompe a quien la use y no
 * hay nada que gane con eso ahora: queda anotado y se hace de una sola vez.
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
    /**
     * Nombre del botón de quitar un chip. Un string es el **prefijo** del dato («Quitar» →
     * «Quitar Chile»), que sirve donde el verbo va adelante. Una función es la **plantilla**
     * entera y sirve en cualquier idioma: `(name) => name + " entfernen"`.
     *
     * Declarala a nivel de módulo o memoizala: es lo único de `Labels` que el provider compara
     * por identidad, porque comparar funciones por contenido no existe.
     */
    remove: string | ((name: string) => string)
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
  pageHeader: {
    /** Nombre del `<nav>` de las migas del encabezado. */
    breadcrumb: string
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
  pageHeader: { breadcrumb: "Migas de pan" },
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
 * ¿Dicen lo mismo los dos objetos ya mezclados?
 *
 * Dos niveles y `Object.is` en las hojas, la misma forma que `mezclar`. Es lo que
 * decide si el provider puede reusar la identidad anterior: 24 `Object.is` medidos
 * en 0,6 µs, que al lado de re-renderizar la app entera no es nada.
 *
 * Un label que es función —hoy solo `combobox.remove`— se compara por identidad,
 * porque comparar funciones por contenido no existe. Declarada adentro del
 * componente cambia en cada render y ahí el provider sí propaga; a nivel de módulo
 * o memoizada, no.
 */
function mismosTextos(a: Labels, b: Labels): boolean {
  const grupos = Object.keys(a) as (keyof Labels)[]
  if (grupos.length !== Object.keys(b).length) return false
  for (const grupo of grupos) {
    const unGrupo = a[grupo] as Record<string, unknown>
    const otroGrupo = b[grupo] as Record<string, unknown> | undefined
    if (!otroGrupo) return false
    const claves = Object.keys(unGrupo)
    if (claves.length !== Object.keys(otroGrupo).length) return false
    for (const clave of claves) if (!Object.is(unGrupo[clave], otroGrupo[clave])) return false
  }
  return true
}

/**
 * Cambia los textos internos de todos los componentes que estén abajo.
 *
 * Anidados se suman: un provider adentro de otro mezcla sobre lo que ya había,
 * no sobre los textos en español. Sirve para una sección en otro idioma sin
 * repetir la traducción entera.
 *
 * **Memoiza contra el contenido y no contra la identidad de `value`.** El caso de
 * uso principal es i18n, y ahí el objeto lo arma un componente —`useTranslations()`
 * de next-intl, un `t(…)` por clave—: con `useMemo` del lado del llamador la
 * identidad cambia en cada render, y un contexto que cambia re-renderiza a todos
 * sus consumidores, que acá es la app entera. Quien lo usa no tiene por qué saber
 * cómo está implementado el provider para que su app no se arrastre, así que el
 * que compara es el provider. Envolver el `value` en un `useMemo` sigue siendo
 * válido y ahorra la comparación, pero ya no hace falta.
 */
export function LabelsProvider({ value, children }: { value?: PartialLabels; children?: React.ReactNode }) {
  const heredado = React.useContext(LabelsContext)
  const mezclado = mezclar(heredado, value)
  // El cache se escribe en render y no en un efecto: el valor tiene que salir
  // ya estable en este mismo render, no en el siguiente. Es seguro aunque React
  // descarte el render —lo único que se reusa es la identidad de un objeto con
  // el mismo contenido—, que es lo que no valdría para un ref con estado.
  const cache = React.useRef(mezclado)
  if (cache.current !== mezclado && !mismosTextos(cache.current, mezclado)) cache.current = mezclado
  return <LabelsContext.Provider value={cache.current}>{children}</LabelsContext.Provider>
}

/**
 * Los textos que corresponden en este punto del árbol. Sin provider arriba,
 * `defaultLabels`.
 */
export function useLabels(): Labels {
  return React.useContext(LabelsContext)
}
