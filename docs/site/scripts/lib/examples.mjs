// El código que se muestra en cada demo sale del mismo archivo que se renderiza.
// Un solo origen: si la demo cambia, el bloque copiable cambia con ella.
//
// Cada `app/_demos/<slug>.tsx` exporta funciones en PascalCase. El extractor se
// queda con el texto de la función y con los imports que esa función realmente usa.
import { readFileSync } from "node:fs"
import { basename } from "node:path"

import ts from "typescript"

/** Imports del archivo cuyo nombre local aparece en el cuerpo de la función. */
function importsFor(source, body) {
  const lines = []
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue
    const specifier = statement.moduleSpecifier.getText().slice(1, -1)
    if (specifier.startsWith(".")) continue // helpers de la demo: no son parte del ejemplo
    const names = []
    const clause = statement.importClause
    if (clause.name && used(body, clause.name.text)) names.push(clause.name.text)
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        if (used(body, element.name.text)) names.push(element.getText())
      }
    }
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      if (used(body, clause.namedBindings.name.text)) names.push(`* as ${clause.namedBindings.name.text}`)
    }
    if (!names.length) continue
    const def = clause.name && used(body, clause.name.text) ? names.shift() : null
    const named = names.length ? `{ ${names.join(", ")} }` : ""
    const what = [def, named].filter(Boolean).join(", ")
    lines.push(`import ${what} from "${specifier}"`)
  }
  return lines.sort()
}

function used(body, name) {
  return new RegExp(`\\b${name.replace(/[$]/g, "\\$")}\\b`).test(body)
}

/**
 * @param {string} file ruta a un `app/_demos/<slug>.tsx`
 * @returns {{ id: string, title: string, description: string, code: string }[]}
 */
export function extractExamples(file) {
  const text = readFileSync(file, "utf8")
  const slug = basename(file, ".tsx")
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX)
  const examples = []

  for (const statement of source.statements) {
    if (!ts.isFunctionDeclaration(statement) || !statement.name) continue
    const isExported = statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    if (!isExported) continue
    const name = statement.name.text
    if (!/^[A-Z]/.test(name)) continue

    // El texto de la función sin el `export `.
    const start = statement.name.getStart() - "function ".length
    const body = text.slice(start, statement.end)
    const tags = ts.getJSDocCommentsAndTags(statement)
    const doc = tags.find(ts.isJSDoc)
    const comment = typeof doc?.comment === "string" ? doc.comment.trim() : ""
    const [title, ...rest] = comment.split("\n")

    const header = importsFor(source, body)
    examples.push({
      id: `${slug}--${name}`,
      component: name,
      title: title || name,
      description: rest.join(" ").trim(),
      code: [header.join("\n"), header.length ? "" : null, body].filter((part) => part !== null).join("\n").trim(),
    })
  }

  return examples
}
