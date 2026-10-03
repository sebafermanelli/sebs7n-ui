// Todo el texto de la landing. Para adaptarla a otro producto se cambia este archivo; la estructura,
// los tamaños y el orden de las secciones quedan como están.

export const PRODUCT = {
  name: "Acme Facturación",
  title: "Facturá en un minuto y cobrá a tiempo",
  subtitle:
    "Emití comprobantes, mandá recordatorios automáticos y mirá lo que te deben en un solo lugar. Sin planillas ni carga doble.",
  primaryCta: "Probar 14 días gratis",
  secondaryCta: "Ver cómo funciona",
}

/** Adónde llevan las llamadas a la acción. En tu app, la ruta de registro. */
export const CTA_HREF = "#registro"

export interface NavItem {
  href: string
  title: string
  description: string
}

/**
 * La navegación: «Producto» y «Ayuda» abren un panel con sus páginas; «Precios» es un link suelto
 * (sin `items`). `href` de un grupo es adonde lleva su rótulo mientras llega el menú (y en el teléfono).
 */
export const NAV: { label: string; href: string; items?: NavItem[] }[] = [
  {
    label: "Producto",
    href: "#beneficios",
    items: [
      { href: "#beneficios", title: "Beneficios", description: "Lo que hace falta para facturar y cobrar" },
      { href: "#producto", title: "Vista del producto", description: "El tablero de cobranzas, por dentro" },
      { href: "#cifras", title: "Cifras", description: "Cuánto se factura y cobra con Acme" },
    ],
  },
  { label: "Precios", href: "#precios" },
  {
    label: "Ayuda",
    href: "#preguntas",
    items: [
      { href: "#preguntas", title: "Preguntas frecuentes", description: "Prueba, baja, datos y cambio de plan" },
      { href: "#opiniones", title: "Opiniones", description: "Lo que cuentan quienes ya lo usan" },
    ],
  },
]

export const CLIENTS = ["Nube Digital", "Estudio Ruiz", "Óptica Sur", "Taller Norte", "Librería Central", "Acme S.A."]

export const FEATURES = [
  { icon: "receipt", title: "Comprobantes en segundos", body: "Elegí el cliente, cargá el concepto y listo: la factura sale numerada y lista para enviar." },
  { icon: "bell", title: "Recordatorios automáticos", body: "Un aviso antes del vencimiento y otro después. Vos no tenés que perseguir a nadie." },
  { icon: "chart", title: "Lo que te deben, a la vista", body: "Pendientes, vencidas y cobradas en un tablero que se actualiza solo." },
  { icon: "users", title: "Todo el equipo", body: "Invitá a quien lleva la administración con permisos por rol." },
  { icon: "download", title: "Exportá cuando quieras", body: "Libro de ventas y reportes en CSV para tu contador, sin pedirlos a soporte." },
  { icon: "shield", title: "Datos seguros", body: "Copias diarias y acceso con verificación en dos pasos." },
] as const

export type FeatureIcon = (typeof FEATURES)[number]["icon"]

export interface Plan {
  name: string
  /** Precio por mes en dólares, pagando mes a mes. 0 es el plan gratis. */
  monthly: number
  description: string
  features: string[]
  /** El plan recomendado: lleva el botón primario. Uno solo. */
  featured?: boolean
  /** Sin registro directo: el botón es «Hablar con ventas». */
  contact?: boolean
}

export const PLANS: Plan[] = [
  {
    name: "Inicial",
    monthly: 0,
    description: "Para empezar a facturar.",
    features: ["Hasta 20 facturas por mes", "1 usuario", "Recordatorios por email"],
  },
  {
    name: "Profesional",
    monthly: 29,
    description: "Para un negocio que cobra todos los meses.",
    features: ["Facturas ilimitadas", "5 usuarios", "Recordatorios automáticos", "Reportes y exportación"],
    featured: true,
  },
  {
    name: "Empresa",
    monthly: 79,
    description: "Para equipos de administración.",
    features: ["Todo lo de Profesional", "Usuarios ilimitados", "Permisos por rol", "Soporte prioritario"],
    /** Se contrata hablando con ventas: su botón abre el formulario en vez de ir al registro. */
    contact: true,
  },
]

/** El precio por mes pagando el año: dos meses gratis, redondeado a entero. */
export const annualMonthly = (monthly: number) => Math.round((monthly * 10) / 12)

/** Lo que muestran los números de reseñas: el promedio (con decimales) y cuántas hay. */
export const REVIEWS = { average: 4.8, count: 212 }

/** Las cifras de la empresa, para `StatGrid`. Ya formateadas: el servidor no calcula nada. */
export const STATS = [
  { label: "Empresas que facturan", value: "12.400", hint: "en Argentina y Uruguay" },
  { label: "Cobrado por mes", value: "US$ 38 M", delta: "+12 %", trend: "up", hint: "vs. el mes anterior" },
  { label: "Cobradas en fecha", value: "93 %", delta: "+4 pts", trend: "up", hint: "vs. antes de usarlo" },
  { label: "Tiempo para emitir", value: "48 s", hint: "de la factura al envío" },
] as const

/** El tablero de la vista del producto: datos de ejemplo, fijos. */
export const DEMO = {
  title: "Cobranzas de septiembre",
  collected: "US$ 12.480",
  delta: "+18 %",
  hint: "vs. agosto",
  /** Cobros por día de los últimos 14 días. */
  series: [320, 410, 380, 520, 480, 610, 590, 700, 650, 820, 760, 910, 880, 1040],
  invoices: [
    { client: "Nube Digital", note: "Pagada el 28/09", status: "Pagada", color: "green", amount: "US$ 1.200" },
    { client: "Estudio Ruiz", note: "Vence en 3 días", status: "Pendiente", color: "amber", amount: "US$ 840" },
    { client: "Óptica Sur", note: "Venció hace 5 días", status: "Vencida", color: "red", amount: "US$ 310" },
    { client: "Taller Norte", note: "Pagada el 25/09", status: "Pagada", color: "green", amount: "US$ 2.050" },
  ],
} as const

export const TESTIMONIALS = [
  { quote: "Pasamos de una planilla a cobrar todo en fecha. Los recordatorios solos ya pagan el plan.", name: "Laura Gómez", rating: 5, since: "2024", role: "Administración, Nube Digital" },
  { quote: "Lo configuramos en una tarde. El contador recibe el libro de ventas sin que se lo mandemos.", name: "Martín Ruiz", rating: 5, since: "2025", role: "Socio, Estudio Ruiz" },
  { quote: "Por fin veo lo que me deben sin abrir cinco archivos.", name: "Carla Sosa", rating: 4, since: "2025", role: "Dueña, Óptica Sur" },
  { quote: "Los clientes pagan antes desde que les llega el aviso solo. Recuperamos semanas de caja.", name: "Diego Herrera", rating: 5, since: "2024", role: "Gerente, Taller Norte" },
  { quote: "Cambiamos de plan dos veces sin hablar con nadie. Todo se ajustó solo.", name: "Paula Ríos", rating: 5, since: "2023", role: "Socia, Librería Central" },
  { quote: "El equipo de cobranzas dejó de usar tres herramientas distintas.", name: "Sergio Paz", rating: 4, since: "2025", role: "Finanzas, Acme S.A." },
]

export const FAQ = [
  { id: "prueba", question: "¿Necesito tarjeta para la prueba?", answer: "No. Son 14 días con todo el plan Profesional; al terminar elegís un plan o pasás al Inicial." },
  { id: "cancelar", question: "¿Puedo cancelar cuando quiera?", answer: "Sí. El plan sigue hasta el final del período pagado y no se renueva. No hay costo de baja." },
  { id: "datos", question: "¿Qué pasa con mis datos si me voy?", answer: "Los podés exportar durante 90 días. Después se borran." },
  { id: "cambiar", question: "¿Puedo cambiar de plan?", answer: "Cuando quieras. Si subís, se cobra la diferencia del mes; si bajás, rige desde el próximo." },
]

export const FOOTER_GROUPS = [
  {
    title: "Producto",
    links: [
      { href: "#beneficios", label: "Beneficios" },
      { href: "#producto", label: "Vista del producto" },
      { href: "#cifras", label: "Cifras" },
      { href: "#precios", label: "Precios" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "#preguntas", label: "Preguntas frecuentes" },
      { href: "#opiniones", label: "Opiniones" },
      { href: "#registro", label: "Empezar" },
    ],
  },
  { title: "Empresa", links: [{ href: "#clientes", label: "Quiénes nos usan" }] },
]
