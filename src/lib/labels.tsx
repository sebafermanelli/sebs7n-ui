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
  ai: {
    /** Nombre del botón flotante que abre el asistente. */
    launcher: string
  }
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
  chat: {
    /** Nombre de la zona de mensajes, para quien no la ve. */
    log: string
    /** Nombre del campo donde se escribe. */
    input: string
    /** Lo que dice el campo vacío. */
    placeholder: string
    /** Nombre del botón de enviar. */
    send: string
    /** Nombre del botón que corta una respuesta en curso. */
    stop: string
    /** Lo que se anuncia mientras el asistente escribe. */
    typing: string
    /** Texto del botón para volver a intentar después de un error. */
    retry: string
  }
  calendar: {
    /** Nombre del botón que va al mes anterior. */
    previousMonth: string
    /** Nombre del botón que va al mes siguiente. */
    nextMonth: string
  }
  calendarView: {
    /** El botón que vuelve a hoy. */
    today: string
    /** Nombre del segmentado de la vista, y sus dos opciones. */
    view: string
    month: string
    week: string
    previousMonth: string
    nextMonth: string
    previousWeek: string
    nextWeek: string
    /** La fila de los eventos de todo el día, en la semana. */
    allDay: string
    /** Antes de la fecha del lunes, en el nombre de la grilla de la semana: «Semana del 28 de septiembre». */
    weekOf: string
    /** Después del número de eventos que no entran en un día del mes: «+2 más». */
    more: string
  }
  colorPicker: {
    /** Nombre del panel que se abre, para quien no lo ve. */
    popup: string
    /** Nombre del grupo de pestañas. */
    tabs: string
    palette: string
    spectrum: string
    values: string
    /** Título de los últimos colores usados. */
    recent: string
    /** Título de la grilla de colores. */
    swatches: string
    /** Nombre del campo de dos ejes de la pestaña Espectro. */
    area: string
    hue: string
    lightness: string
    chroma: string
    hex: string
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
  command: {
    /** Lo que dice el campo vacío, y su nombre para el lector si no trae otro. */
    placeholder: string
    /** Lo que dice la lista cuando no hay resultados. */
    empty: string
    /** Nombre del diálogo de `CommandDialog`, para quien no lo ve. */
    dialog: string
    /** Nombre del grupo de filtros de `CommandFilters`. */
    filters: string
  }
  copyButton: {
    /** Nombre del botón y texto del tooltip antes de copiar. */
    copy: string
    /** Lo que dice el tooltip y se anuncia después de copiar. */
    copied: string
  }
  countryPicker: {
    /** El idioma de los nombres de los países (`Intl.DisplayNames`), como lo entiende `Intl`. */
    locale: string
    /** Lo que dice el campo sin país elegido. */
    placeholder: string
  }
  dataTable: {
    /** El nombre y el placeholder de la búsqueda. */
    search: string
    /** La casilla de la cabecera. */
    selectAll: string
    /** Antes del nombre de la fila en su casilla: «Seleccionar Acme S.A.». */
    selectRow: string
    loadMore: string
    /** La fila de la tabla vacía. */
    empty: string
    /** El total que se anuncia al buscar: «1 resultado», «12 resultados». */
    result: string
    results: string
    /** El contador de un grupo: «1 ítem», «6 ítems». */
    item: string
    items: string
    /** Lo elegido, que se anuncia con el total (puede estar en otra página o filtrado): «2 seleccionadas». */
    selectedOne: string
    selectedMany: string
  }
  datePicker: {
    /** Lo que dice el campo cuando no hay fecha elegida. */
    placeholder: string
    /** Lo mismo, cuando lo que se elige es un rango. */
    rangePlaceholder: string
    /** Nombre del panel que se abre, para quien no lo ve. */
    calendar: string
    /** El botón que vacía la fecha, con `clearable`. */
    clear: string
  }
  dateTimePicker: {
    /** Nombre del campo de la hora, adentro del campo de fecha y hora. */
    time: string
  }
  dialog: {
    /** Nombre del botón X. */
    close: string
  }
  drawer: { close: string }
  meter: {
    /** «Libre», en la cabecera de `StackedMeter`. */
    free: string
    /** «Usado», en la cabecera de `StackedMeter`. */
    used: string
  }
  multiSelect: {
    /** La opción de arriba de la lista que marca todas las que se ven. */
    selectAll: string
    /** Antes del tope, en la lista, cuando se llegó: «Máximo 3». */
    max: string
  }
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
  passwordInput: {
    /** Nombre del botón del ojo; `aria-pressed` dice si se está mostrando. */
    show: string
    /** El título de la barra de seguridad. */
    strength: string
    /** Los cuatro niveles, de menos a más. */
    weak: string
    fair: string
    good: string
    strong: string
  }
  phoneInput: {
    /** Antes del país elegido, en el nombre del selector: «Código de país: Argentina (+54)». */
    country: string
  }
  resizable: {
    /** El nombre de un separador sin `aria-label`. Mejor uno propio: «Ancho de la lista». */
    handle: string
  }
  sheet: { close: string }
  sidebar: {
    /** Nombre del `<nav>` del sidebar. */
    nav: string
    /** Placeholder del buscador del sidebar. */
    search: string
  }
  stepper: {
    /** Nombre de la lista de pasos, si no trae `aria-label`. */
    label: string
    /**
     * Lo que se lee después del título de cada paso, según su estado: «Cliente, completado». El
     * actual no lleva texto: lo dice `aria-current="step"`.
     */
    complete: string
    upcoming: string
    error: string
  }
  themeSwitcher: {
    /** Nombre del grupo de opciones. */
    group: string
    light: string
    dark: string
    system: string
  }
  timePicker: {
    /** Lo que dice el campo vacío. */
    placeholder: string
    /** Lo que se anuncia cuando lo tipeado no es una hora y el campo vuelve a la anterior. */
    invalid: string
  }
  tree: {
    /** Lo que se lee en una carpeta mientras llegan sus hijos. */
    loading: string
  }
  userMenu: {
    /** Encabezado de la sección de tema adentro del menú. */
    theme: string
  }
}

export const defaultLabels: Labels = {
  ai: { launcher: "Asistente" },
  appShell: {
    openMenu: "Abrir menú",
    navigation: "Navegación",
    skipToContent: "Ir al contenido",
  },
  autocomplete: {
    clear: "Limpiar",
    trigger: "Ver sugerencias",
  },
  chat: {
    log: "Conversación",
    input: "Mensaje",
    placeholder: "Escribí tu pregunta…",
    send: "Enviar",
    stop: "Detener respuesta",
    typing: "Escribiendo una respuesta",
    retry: "Reintentar",
  },
  calendar: {
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
  },
  calendarView: {
    today: "Hoy",
    view: "Vista",
    month: "Mes",
    week: "Semana",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    previousWeek: "Semana anterior",
    nextWeek: "Semana siguiente",
    allDay: "Todo el día",
    weekOf: "Semana del",
    more: "más",
  },
  colorPicker: {
    popup: "Selector de color",
    tabs: "Cómo elegir el color",
    palette: "Paleta",
    spectrum: "Espectro",
    values: "Valores",
    recent: "Recientes",
    swatches: "Todos los matices",
    area: "Croma y luminosidad",
    hue: "Matiz",
    lightness: "Luminosidad",
    chroma: "Croma",
    hex: "Hexadecimal",
  },
  combobox: {
    clear: "Limpiar",
    trigger: "Abrir lista",
    loading: "Buscando…",
    empty: "Sin resultados",
    remove: "Quitar",
  },
  command: {
    placeholder: "Buscar",
    empty: "Sin resultados",
    dialog: "Buscar",
    filters: "Filtros",
  },
  copyButton: { copy: "Copiar", copied: "Copiado" },
  countryPicker: { locale: "es-AR", placeholder: "Elegí un país" },
  dataTable: {
    search: "Buscar",
    selectAll: "Seleccionar todas",
    selectRow: "Seleccionar",
    loadMore: "Cargar más",
    empty: "Sin resultados",
    result: "resultado",
    results: "resultados",
    item: "ítem",
    items: "ítems",
    selectedOne: "seleccionada",
    selectedMany: "seleccionadas",
  },
  datePicker: {
    placeholder: "Elegí una fecha",
    rangePlaceholder: "Elegí un rango",
    calendar: "Calendario",
    clear: "Limpiar",
  },
  dateTimePicker: { time: "Hora" },
  dialog: { close: "Cerrar" },
  drawer: { close: "Cerrar" },
  meter: { free: "Libre", used: "Usado" },
  multiSelect: {
    selectAll: "Seleccionar todo",
    max: "Máximo",
  },
  numberField: {
    decrement: "Disminuir",
    increment: "Aumentar",
    roleDescription: "Campo numérico",
  },
  pageHeader: { breadcrumb: "Migas de pan" },
  passwordInput: {
    show: "Mostrar contraseña",
    strength: "Seguridad",
    weak: "Débil",
    fair: "Aceptable",
    good: "Buena",
    strong: "Fuerte",
  },
  phoneInput: { country: "Código de país" },
  resizable: { handle: "Cambiar el tamaño" },
  sheet: { close: "Cerrar" },
  sidebar: {
    nav: "Navegación principal",
    search: "Buscar…",
  },
  stepper: {
    label: "Pasos",
    complete: "completado",
    upcoming: "pendiente",
    error: "con error",
  },
  themeSwitcher: {
    group: "Tema",
    light: "Tema claro",
    dark: "Tema oscuro",
    system: "Tema del sistema",
  },
  timePicker: { placeholder: "hh:mm", invalid: "Hora no válida" },
  tree: { loading: "Cargando…" },
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
