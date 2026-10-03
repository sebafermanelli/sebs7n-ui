// Los destinos de la barra y del pie del sitio. Mismo formato que `NAV` de la landing de referencia
// (`templates/landing/_data/content.ts`): un grupo con `items` se despliega, uno sin `items` es un link.

export interface NavItem {
  href: string
  title: string
  description: string
}

export interface NavEntry {
  label: string
  href: string
  items?: NavItem[]
}

export const GITHUB_URL = "https://github.com/sebafermanelli/sebs7n-ui"

/** Adónde lleva «Empezar»: la instalación. */
export const START_HREF = "/docs/instalacion"

export const TEMPLATES: NavItem[] = [
  { href: "/templates/dashboard", title: "SaaS / Dashboard", description: "Una app de trabajo con sidebar y tablas" },
  { href: "/templates/landing", title: "Landing page", description: "El default para páginas de marketing" },
  { href: "/templates/console", title: "Consola PaaS / Cloud", description: "Despliegues, variables y logs" },
  { href: "/templates/blog", title: "Blog / Editorial", description: "Lectura larga y listados" },
]

export const NAV: NavEntry[] = [
  {
    label: "Docs",
    href: "/docs/instalacion",
    items: [
      { href: "/docs/instalacion", title: "Instalación", description: "Una dependencia y cuatro variables de marca" },
      { href: "/docs/guia-agentes", title: "Guía para agentes", description: "Las reglas del sistema y las recetas" },
      { href: "/docs/tokens", title: "Tokens", description: "Superficies, tipografía, radios y sombras" },
    ],
  },
  {
    label: "Componentes",
    href: "/docs",
    items: [
      { href: "/docs", title: "Todos los componentes", description: "El catálogo completo, por grupo" },
      { href: "/docs/components/button", title: "Button", description: "Variantes, tamaños y estados" },
      { href: "/docs/components/card", title: "Card", description: "Superficies y grillas parejas" },
      { href: "/docs/components/data-table", title: "DataTable", description: "Búsqueda, orden y selección" },
    ],
  },
  { label: "Templates", href: "/templates", items: [{ href: "/templates", title: "Todos los templates", description: "Pantallas completas para copiar" }, ...TEMPLATES] },
  { label: "Playground", href: "/docs/playground" }
]

export const FOOTER_GROUPS = [
  {
    title: "Documentación",
    links: [
      { href: "/docs/instalacion", label: "Instalación" },
      { href: "/docs/guia-agentes", label: "Guía para agentes" },
      { href: "/docs/tokens", label: "Tokens" },
      { href: "/docs/theming", label: "Theming" }
    ]
  },
  {
    title: "Componentes",
    links: [
      { href: "/docs", label: "Todos los componentes" },
      { href: "/docs/playground", label: "Playground" },
      { href: "/docs/iconos", label: "Iconos" },
      { href: "/templates", label: "Templates" }
    ]
  },
  {
    title: "Recursos",
    links: [
      { href: GITHUB_URL, label: "GitHub" },
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/r/registry.json", label: "Registry" },
      { href: "https://www.npmjs.com/package/sebs7n-ui", label: "npm" }
    ]
  }
]
