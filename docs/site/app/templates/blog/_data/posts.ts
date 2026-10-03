export type Block =
  | { type: "h2"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string }

export interface Author {
  id: string
  name: string
  role: string
}

export interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  authorId: string
  tags: string[]
  body: Block[]
}

export const BLOG = {
  name: "Acme Journal",
  tagline: "Notas sobre diseño, producto e ingeniería de un equipo que construye software.",
}

export const AUTHORS: Author[] = [
  { id: "lucia", name: "Lucía Ferreyra", role: "Ingeniería" },
  { id: "martin", name: "Martín Cabrera", role: "Diseño de producto" },
  { id: "sofia", name: "Sofía Ibarra", role: "Producto" },
]

export const POSTS: Post[] = [
  {
    slug: "guia-de-estilo-que-se-usa",
    title: "Una guía de estilo que el equipo realmente usa",
    excerpt: "Las guías mueren cuando viven en un PDF. Lo que funcionó para nosotros: reglas cortas, ejemplos vivos y un lugar único donde cambiarlas.",
    date: "2026-09-28",
    authorId: "martin",
    tags: ["Diseño", "Equipos"],
    body: [
      { type: "p", text: "Todo equipo empieza con la misma intención: escribir una guía de estilo y que todos la sigan. Seis meses después, la guía es un documento que nadie abre y las pantallas se parecen cada vez menos entre sí." },
      { type: "h2", id: "por-que-mueren", text: "Por qué mueren las guías" },
      { type: "p", text: "Una guía muere cuando cambiarla cuesta más que ignorarla. Si para ajustar un color hay que editar un PDF, avisar por tres canales y esperar una reunión, la gente ajusta el color en su pantalla y sigue." },
      { type: "quote", text: "La regla que no se puede probar es una sugerencia.", cite: "Martín Cabrera" },
      { type: "h2", id: "reglas-cortas", text: "Reglas cortas, con un porqué" },
      { type: "p", text: "Escribimos cada regla en una línea y le pusimos al lado la razón. «Un solo botón primario por pantalla» es fácil de recordar; «porque dos acentos compiten y nadie sabe qué hacer primero» es lo que convence." },
      { type: "list", items: ["Una regla por línea, en imperativo.", "Siempre con su razón entre paréntesis.", "Un ejemplo vivo al lado, no una captura.", "Un test cuando la regla se puede medir."] },
      { type: "h2", id: "un-solo-lugar", text: "Un solo lugar para cambiarlas" },
      { type: "p", text: "La guía vive en el mismo repositorio que el código. Cambiar una regla es un pull request: se discute, se aprueba y llega a todos con la próxima versión. Lo que no está en el repositorio no existe." },
    ],
  },
  {
    slug: "despliegues-sin-miedo",
    title: "Desplegar un viernes sin sudar",
    excerpt: "Tres hábitos —despliegues chicos, reversión de un clic y métricas a la vista— que nos sacaron el miedo a publicar.",
    date: "2026-09-21",
    authorId: "lucia",
    tags: ["Ingeniería", "Operaciones"],
    body: [
      { type: "p", text: "Durante años tuvimos una regla no escrita: nada se publica después del mediodía del jueves. La regla no protegía el producto; protegía nuestros fines de semana, y lo hacía mal." },
      { type: "h2", id: "cambios-chicos", text: "Cambios chicos" },
      { type: "p", text: "Un despliegue grande tiene mil formas de fallar y una sola de entenderse: leer todo el diff. Uno chico falla de una manera y se explica solo. Bajamos el tamaño promedio de un cambio de 400 a 60 líneas." },
      { type: "h2", id: "volver-atras", text: "Volver atrás en un clic" },
      { type: "p", text: "El miedo no viene de que algo falle, sino de no saber cómo deshacerlo. Cada despliegue conserva el anterior y revertir es un botón, no un procedimiento." },
      { type: "code", code: "deploy rollback --service api --to previous" },
      { type: "h2", id: "ver-lo-que-pasa", text: "Ver lo que pasa" },
      { type: "p", text: "Después de publicar miramos tres cosas: errores por minuto, latencia y uso de memoria. Si alguna se mueve, revertimos primero y preguntamos después." },
    ],
  },
  {
    slug: "tokens-de-color-con-contraste",
    title: "Tokens de color que cumplen contraste por construcción",
    excerpt: "Elegir un color de marca no debería romper la accesibilidad. Cómo derivamos la escala para que el texto siempre llegue a 4,5:1.",
    date: "2026-09-12",
    authorId: "martin",
    tags: ["Diseño", "Accesibilidad"],
    body: [
      { type: "p", text: "El contraste suele revisarse al final, cuando cambiar un color ya es caro. Lo invertimos: la escala se calcula de modo que cumplir sea el camino fácil y no cumplir exija esforzarse." },
      { type: "h2", id: "luminosidad-fija", text: "Luminosidad fija, croma variable" },
      { type: "p", text: "Cada paso de la escala tiene una luminosidad fija y el color de marca solo aporta el matiz y la croma. Así un azul oscuro y un amarillo claro dan escalas con el mismo contraste entre pasos." },
      { type: "h2", id: "tests", text: "Un test que lee los valores" },
      { type: "p", text: "Un test recorre todos los pares de texto y fondo, calcula el contraste y falla si alguno baja de 4,5:1. No hay revisión visual que se pueda olvidar." },
      { type: "quote", text: "Si la accesibilidad depende de la memoria de alguien, no es una garantía.", cite: "Equipo de diseño" },
    ],
  },
  {
    slug: "roadmap-que-cambia",
    title: "Un roadmap que se puede cambiar sin pedir perdón",
    excerpt: "Pasamos de promesas con fecha a apuestas con evidencia. Qué ganamos, qué perdimos y cómo lo explicamos a quienes dependen de él.",
    date: "2026-08-30",
    authorId: "sofia",
    tags: ["Producto", "Equipos"],
    body: [
      { type: "p", text: "Un roadmap con fechas es una promesa. Cuando la promesa se rompe —y se rompe— la conversación deja de ser sobre el producto y pasa a ser sobre la confianza." },
      { type: "h2", id: "apuestas", text: "Apuestas, no promesas" },
      { type: "p", text: "Cada ítem pasó a ser una apuesta: qué creemos, qué evidencia tenemos, qué esperamos mover y cuándo la revisamos. Si la evidencia cambia, la apuesta cambia, y eso es el sistema funcionando." },
      { type: "list", items: ["Ahora: lo que está en construcción.", "Después: lo que viene con evidencia.", "Más adelante: ideas que todavía son preguntas."] },
      { type: "h2", id: "comunicar", text: "Cómo lo comunicamos" },
      { type: "p", text: "Una vez por mes publicamos qué cambió en el roadmap y por qué. Lo importante no es acertar, sino que quien depende de nosotros no se entere por casualidad." },
    ],
  },
  {
    slug: "pruebas-que-importan",
    title: "Las pruebas que sí vale la pena escribir",
    excerpt: "No todo test paga su costo. Una forma de decidir qué probar, qué dejar y qué dejar de mantener.",
    date: "2026-08-18",
    authorId: "lucia",
    tags: ["Ingeniería"],
    body: [
      { type: "p", text: "Más pruebas no significan mejor software. Una suite lenta, frágil y llena de duplicados enseña al equipo a ignorar los rojos, que es peor que no tenerla." },
      { type: "h2", id: "que-probar", text: "Qué probar" },
      { type: "p", text: "Probamos lo que cuesta caro si se rompe y lo que es difícil de ver a ojo: cálculos, permisos, reglas de negocio. Lo demás se cubre con revisión y con uso." },
      { type: "h2", id: "que-dejar", text: "Qué dejar de mantener" },
      { type: "p", text: "Un test que falla por razones que no son un bug se borra o se reescribe el mismo día. Mantener un test que nadie confía es pagar por ruido." },
    ],
  },
  {
    slug: "documentar-para-agentes",
    title: "Documentación que también lee una máquina",
    excerpt: "Cada página se sirve como texto plano y el sitio publica un índice. Por qué escribir para agentes mejoró la documentación para las personas.",
    date: "2026-08-05",
    authorId: "sofia",
    tags: ["Producto"],
    body: [
      { type: "p", text: "Cuando empezamos a pensar en cómo un agente lee nuestra documentación, nos dimos cuenta de que muchas páginas fallaban también para las personas: títulos vagos, ejemplos incompletos, reglas escondidas." },
      { type: "h2", id: "texto-plano", text: "Cada página, también como texto" },
      { type: "p", text: "Toda página tiene una versión en texto plano con la misma estructura. No es un extra: es la prueba de que el contenido se entiende sin el diseño alrededor." },
      { type: "h2", id: "un-indice", text: "Un índice en la raíz" },
      { type: "p", text: "Un archivo en la raíz lista todas las páginas con una línea de descripción. Sirve para un agente y sirve para quien llega sin saber qué buscar." },
    ],
  },
  {
    slug: "rendimiento-lo-que-se-ve",
    title: "Rendimiento: primero lo que se ve",
    excerpt: "Antes de optimizar nada, medimos qué tarda en aparecer lo que la persona vino a hacer. Casi siempre era un solo componente.",
    date: "2026-07-22",
    authorId: "lucia",
    tags: ["Ingeniería", "Operaciones"],
    body: [
      { type: "p", text: "Optimizar sin medir es adivinar con más trabajo. Nos pasó: pasamos dos semanas bajando el peso de un paquete que no estaba en el camino de nadie." },
      { type: "h2", id: "medir-primero", text: "Medir lo que importa" },
      { type: "p", text: "Elegimos una sola pregunta: ¿cuánto pasa hasta que se puede leer el contenido principal? Todo lo que no mueve ese número espera." },
      { type: "h2", id: "diferir", text: "Diferir lo que no hace falta al abrir" },
      { type: "p", text: "El selector de tema, el formulario del pie y los menús desplegables no se usan en el primer segundo. Los cargamos después de hidratar y la página dejó de pagar por ellos." },
      { type: "list", items: ["Server Components por defecto.", "Lo interactivo y no inmediato, diferido.", "Una caja del mismo tamaño mientras llega, para que nada salte."] },
    ],
  },
  {
    slug: "entrevistas-con-usuarios",
    title: "Entrevistas que cambian el producto",
    excerpt: "Hacer cinco entrevistas bien vale más que cincuenta encuestas. Cómo las preparamos y qué hacemos con lo que escuchamos.",
    date: "2026-06-26",
    authorId: "sofia",
    tags: ["Producto"],
    body: [
      { type: "p", text: "Una entrevista no es una encuesta hablada. Si preguntás «¿te gustaría esta función?», la respuesta siempre es que sí." },
      { type: "h2", id: "preguntar-por-el-pasado", text: "Preguntar por el pasado" },
      { type: "p", text: "Preguntamos por lo que la persona hizo la última vez, no por lo que haría. «Contame la última vez que cobraste una factura vencida» da más información que cualquier hipótesis." },
      { type: "h2", id: "volver-al-equipo", text: "Volver al equipo con frases, no con conclusiones" },
      { type: "p", text: "Después de cada entrevista dejamos tres frases textuales en el canal del equipo. Las conclusiones son nuestras; las frases son de ellos, y convencen más." },
    ],
  },
  {
    slug: "accesibilidad-por-teclado",
    title: "Si no se puede usar con teclado, no está terminado",
    excerpt: "Recorrer cada pantalla solo con Tab y Enter encuentra más problemas que cualquier auditoría automática. Nuestra lista de chequeo.",
    date: "2026-06-02",
    authorId: "martin",
    tags: ["Accesibilidad", "Diseño"],
    body: [
      { type: "p", text: "Guardamos el mouse en un cajón durante una tarde y recorrimos nuestra propia aplicación. Terminamos con una lista de veintitrés problemas que ninguna herramienta había marcado." },
      { type: "h2", id: "orden-del-foco", text: "El orden del foco es el orden de lectura" },
      { type: "p", text: "Si Tab salta de la barra al pie y se olvida del contenido, el problema suele ser un elemento posicionado a mano. Se arregla en el DOM, no con tabindex." },
      { type: "h2", id: "foco-visible", text: "El foco se ve siempre" },
      { type: "p", text: "Un anillo de foco de 3 píxeles con contraste suficiente sobre cualquier fondo. Quitar el contorno sin reemplazarlo es el error más común y el más fácil de evitar." },
      { type: "list", items: ["Tab recorre todo lo interactivo.", "Escape cierra lo que abrió.", "El foco vuelve a donde estaba.", "Nada depende del hover."] },
    ],
  },
]

export const TAGS = [...new Set(POSTS.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b, "es"))

export const authorOf = (post: Post) => AUTHORS.find((author) => author.id === post.authorId)!
export const findPost = (slug: string) => POSTS.find((post) => post.slug === slug)
