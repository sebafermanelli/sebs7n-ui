// Cada página del sitio se sirve también como .md en la misma URL + ".md".
// Un agente lee eso en vez de parsear HTML; una persona lee la página. Los dos
// salen del mismo modelo, así que no se desincronizan.

const cell = (text) => String(text ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")

function table(headers, rows) {
  if (!rows.length) return ""
  return [
    `| ${headers.join(" | ")} |`,
    `|${headers.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n")
}

function propsTable(props) {
  return table(
    ["Prop", "Tipo", "Por defecto", "Descripción"],
    props.map((prop) => [
      `\`${prop.name}\`${prop.required ? " *" : ""}`,
      `\`${prop.type}\``,
      prop.default ? `\`${prop.default}\`` : "—",
      // La marca va en la descripción y no en una columna nueva: es una nota de
      // procedencia, no un dato que se compare fila contra fila.
      [prop.inherited ? "**Heredada de Base UI.**" : "", prop.description].filter(Boolean).join(" ") || "—",
    ])
  )
}

/** Markdown de una página de componente. */
export function componentMarkdown(component) {
  const parts = [`# ${component.title}`, "", `> ${component.description}`, ""]

  parts.push("```tsx", component.importLine, "```", "")
  if (!component.useClient) {
    parts.push("Sin `\"use client\"`: sirve en un Server Component.", "")
  }

  if (component.examples.length) {
    parts.push("## Ejemplos", "")
    for (const example of component.examples) {
      parts.push(`### ${example.title}`, "")
      if (example.description) parts.push(example.description, "")
      parts.push("```tsx", example.code, "```", "")
    }
  }

  parts.push("## Props", "")
  for (const exported of component.exports) {
    parts.push(`### ${exported.name}`, "")
    if (exported.bases.length) {
      parts.push(`Hereda las props de ${exported.bases.map((base) => `\`${base}\``).join(" y ")}.`, "")
    }
    if (exported.props.length) {
      parts.push(propsTable(exported.props), "")
      if (exported.props.some((prop) => prop.required)) parts.push("`*` obligatoria.", "")
    } else {
      parts.push("Sin props propias: pasa todo al primitivo.", "")
    }
  }

  if (component.keyboard.length) {
    parts.push("## Teclado", "", table(["Tecla", "Qué hace"], component.keyboard), "")
  }
  if (component.a11y.length) {
    parts.push("## Accesibilidad", "", ...component.a11y.map((line) => `- ${line}`), "")
  }
  if (component.usage.length) {
    parts.push("## Reglas de uso", "", ...component.usage.map((line) => `- ${line}`), "")
  }
  if (component.related.length) {
    parts.push(
      "## Relacionados",
      "",
      component.related.map((slug) => `[${slug}](/docs/components/${slug}.md)`).join(" · "),
      ""
    )
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n"
}

/** Markdown de una página de sistema (el contenido ya viene en markdown). */
export function pageMarkdown(page) {
  return [`# ${page.title}`, "", `> ${page.description}`, "", page.body.trim(), ""].join("\n")
}

export function llmsTxt({ site, blurb, sections }) {
  const parts = ["# sebs7n-ui", "", `> ${blurb}`, ""]
  for (const section of sections) {
    parts.push(`## ${section.title}`, "")
    for (const item of section.items) {
      // `url` es para lo que no es una página del sitio y por lo tanto no tiene
      // su gemelo en .md — hoy, el índice del registry.
      parts.push(`- [${item.title}](${item.url ?? `${site}${item.href}.md`}): ${item.description}`)
    }
    parts.push("")
  }
  return parts.join("\n")
}

export { table }
