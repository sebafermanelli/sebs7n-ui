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

export const NAV_LINKS = [
  { href: "#beneficios", label: "Beneficios" },
  { href: "#precios", label: "Precios" },
  { href: "#preguntas", label: "Preguntas" },
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
  },
]

/** El precio por mes pagando el año: dos meses gratis, redondeado a entero. */
export const annualMonthly = (monthly: number) => Math.round((monthly * 10) / 12)

export const TESTIMONIALS = [
  { quote: "Pasamos de una planilla a cobrar todo en fecha. Los recordatorios solos ya pagan el plan.", name: "Laura Gómez", role: "Administración, Nube Digital" },
  { quote: "Lo configuramos en una tarde. El contador recibe el libro de ventas sin que se lo mandemos.", name: "Martín Ruiz", role: "Socio, Estudio Ruiz" },
  { quote: "Por fin veo lo que me deben sin abrir cinco archivos.", name: "Carla Sosa", role: "Dueña, Óptica Sur" },
]

export const FAQ = [
  { id: "prueba", question: "¿Necesito tarjeta para la prueba?", answer: "No. Son 14 días con todo el plan Profesional; al terminar elegís un plan o pasás al Inicial." },
  { id: "cancelar", question: "¿Puedo cancelar cuando quiera?", answer: "Sí. El plan sigue hasta el final del período pagado y no se renueva. No hay costo de baja." },
  { id: "datos", question: "¿Qué pasa con mis datos si me voy?", answer: "Los podés exportar durante 90 días. Después se borran." },
  { id: "cambiar", question: "¿Puedo cambiar de plan?", answer: "Cuando quieras. Si subís, se cobra la diferencia del mes; si bajás, rige desde el próximo." },
]

export const FOOTER_GROUPS = [
  { title: "Producto", links: [{ href: "#beneficios", label: "Beneficios" }, { href: "#precios", label: "Precios" }] },
  { title: "Ayuda", links: [{ href: "#preguntas", label: "Preguntas frecuentes" }, { href: "#registro", label: "Empezar" }] },
]
