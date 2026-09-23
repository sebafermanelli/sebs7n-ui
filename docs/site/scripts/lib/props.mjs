// Extrae la tabla de props de cada componente desde el TypeScript del paquete.
//
// ¿Por qué el compilador de TS y no react-docgen-typescript?
//
// 1. Las props de sebs7n-ui son casi siempre `Omit<BaseUI.X.Props, "className"> & { … }`.
//    Con react-docgen-typescript hay que filtrar igual por archivo de declaración
//    para no volcar las ~120 props heredadas de Base UI en cada tabla, así que la
//    parte difícil no la resuelve él.
// 2. Los enums de variante (`variant`, `size`, `shape`) vienen de `VariantProps<typeof cva>`,
//    que es un tipo mapeado: sus símbolos declaran en node_modules/class-variance-authority.
//    Cualquier filtro "declarado en src/" los tira. Acá se rescatan porque el componente
//    los desestructura en la firma — la señal de que la prop es suya.
// 3. Los valores por defecto viven en el patrón de desestructuración (`size = "md"`),
//    que es AST puro y no sobrevive al .d.ts.
//
// `typescript` ya es devDependency del paquete, así que no agrega dependencias nuevas.
import { readFileSync } from "node:fs"
import { join, sep } from "node:path"

import ts from "typescript"

const DROP = new Set(["children", "key", "ref"])

/** `Omit<Menu.Popup.Props, "className"> & …` → ["Menu.Popup", …] para la línea "hereda de". */
export function basesFromTypeText(text) {
  const bases = new Set()
  for (const [, tag] of text.matchAll(/(?:React\.)?ComponentProps<\s*"([a-z0-9]+)"\s*>/g)) bases.add(`<${tag}>`)
  for (const [, tag] of text.matchAll(/useRender\.ComponentProps<\s*"([a-z0-9]+)"\s*>/g)) bases.add(`<${tag}>`)
  for (const [, name] of text.matchAll(/\b([A-Z][A-Za-z0-9]*Primitive(?:\.[A-Za-z0-9]+)*)\.Props\b/g)) {
    bases.add(name.replace(/Primitive/, ""))
  }
  // `const Combobox = ComboboxPrimitive.Root` (sin `.Props`: es el primitivo entero)
  if (!/\.Props\b/.test(text)) {
    for (const [, name] of text.matchAll(/\b([A-Z][A-Za-z0-9]*Primitive(?:\.[A-Za-z0-9]+)+)\s*$/g)) {
      bases.add(name.replace(/Primitive/, ""))
    }
  }
  return [...bases]
}

/** Limpia lo que el checker agrega y no aporta en una tabla. */
export function cleanTypeText(text) {
  return text
    .replace(/\s*\|\s*undefined\b/g, "")
    .replace(/\s*\|\s*null\b(?=\s*$|\s*\|)/g, "")
    .replace(/\bimport\("[^"]+"\)\./g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function jsdocOf(symbol, checker) {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim()
  return text ? text.replace(/\s*\n\s*/g, " ") : ""
}

/** Nombres que el componente desestructura en su firma: son props suyas aunque el tipo venga de afuera. */
function destructured(param) {
  const out = new Map()
  if (!param || !param.name || !ts.isObjectBindingPattern(param.name)) return out
  for (const element of param.name.elements) {
    if (element.dotDotDotToken) continue
    const key = element.propertyName ?? element.name
    const name = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : undefined
    if (!name) continue
    out.set(name, element.initializer ? element.initializer.getText() : undefined)
  }
  return out
}

/**
 * El texto del tipo de props tal como está escrito. Si la firma dice `ButtonProps`,
 * sigue el alias hasta su definición: es ahí donde está el `Omit<…> & { … }` que
 * dice de qué hereda.
 */
function propsTypeText(typeNode, checker) {
  if (!typeNode) return ""
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    const symbol = checker.getSymbolAtLocation(typeNode.typeName)
    const alias = symbol?.declarations?.find(ts.isTypeAliasDeclaration)
    if (alias) return alias.type.getText()
  }
  return typeNode.getText()
}

/**
 * Une los literales de una unión (`"sm" | "md"`), o null si no es una unión de literales.
 *
 * Un parámetro de tipo se reemplaza por su restricción. `ButtonProps` es genérico en el `size`
 * —así la exigencia de `aria-label` cae solo sobre los tamaños de ícono escritos literales—, y en
 * la tabla de props lo que sirve es la lista de tamaños, no la letra `S`.
 */
function literalUnionText(type, checker) {
  if (!type.isUnion() && !(type.flags & ts.TypeFlags.TypeParameter)) return null
  const planos = []
  const aplanar = (candidato) => {
    if (candidato.flags & ts.TypeFlags.TypeParameter) {
      const base = checker.getBaseConstraintOfType(candidato)
      if (base && base !== candidato) return aplanar(base)
    }
    if (candidato.isUnion()) return candidato.types.forEach(aplanar)
    planos.push(candidato)
  }
  aplanar(type)
  const parts = []
  for (const constituent of planos) {
    if (constituent.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) continue
    if (constituent.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)) return "boolean"
    if (!constituent.isStringLiteral() && !constituent.isNumberLiteral()) return null
    parts.push(checker.typeToString(constituent))
  }
  return parts.length > 1 ? parts.join(" | ") : null
}

function firstParam(declaration) {
  if (ts.isFunctionDeclaration(declaration) || ts.isFunctionExpression(declaration) || ts.isArrowFunction(declaration)) {
    return declaration.parameters[0]
  }
  if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
    const init = declaration.initializer
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return init.parameters[0]
  }
  return undefined
}

function isComponentName(name) {
  return /^[A-Z]/.test(name)
}

/**
 * @param {{ root: string, files: string[], documented?: (slug: string, component: string) => string[] }} options
 *   `root` es la raíz del paquete; `files`, rutas relativas. `documented` devuelve las props que
 *   `meta.mjs` describe para ese export: las que no son propias entran igual, marcadas `inherited`.
 * @returns {Map<string, {name, file, description, bases, alias, props}[]>} por archivo (`button`, `card`, …)
 */
export function extractProps({ root, files, documented }) {
  const absolute = files.map((file) => join(root, file))
  const program = ts.createProgram(absolute, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    allowImportingTsExtensions: true,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
  })
  const checker = program.getTypeChecker()
  const srcDir = join(root, "src") + sep
  const result = new Map()

  for (const path of absolute) {
    const slug = path.slice(srcDir.length + "components/".length).replace(/\.tsx?$/, "")
    const source = program.getSourceFile(path)
    if (!source) throw new Error(`No se pudo leer ${path}`)
    const moduleSymbol = checker.getSymbolAtLocation(source)
    if (!moduleSymbol) continue

    const components = []
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const name = exported.getName()
      if (!isComponentName(name)) continue
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
      const declaration = symbol.declarations?.[0]
      if (!declaration) continue
      // Solo funciones/consts: los `type Foo = …` reexportados no son componentes.
      const isType = symbol.flags & (ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Interface)
      if (isType) continue

      const param = firstParam(declaration)
      const defaults = destructured(param)
      const annotation = propsTypeText(param?.type, checker)
      let propsType

      if (param) {
        propsType = checker.getTypeAtLocation(param)
      } else {
        // `const Combobox = ComboboxPrimitive.Root`: sin firma propia, las props son las del primitivo.
        const type = checker.getTypeOfSymbolAtLocation(symbol, declaration)
        const [signature] = type.getCallSignatures()
        propsType = signature?.getParameters()?.[0]
          ? checker.getTypeOfSymbolAtLocation(signature.getParameters()[0], declaration)
          : undefined
      }

      const aliasText =
        !param && ts.isVariableDeclaration(declaration) && declaration.initializer
          ? declaration.initializer.getText()
          : ""

      // Las props que meta.mjs describe para este export. Si no son propias son
      // heredadas del primitivo, y **esas son justo las que hacen al componente**:
      // `onFormSubmit` en Form, `items` en Select, `multiple` en Combobox. Antes se
      // escribía la descripción en meta.mjs y el sitio no mostraba la fila, porque
      // el generador solo iteraba props propias: 19 descripciones invisibles.
      const documentedHere = new Set(documented?.(slug, name) ?? [])

      const props = []
      if (propsType) {
        for (const prop of checker.getPropertiesOfType(propsType)) {
          const propName = prop.getName()
          if (DROP.has(propName)) continue
          const propDeclaration = prop.declarations?.[0]
          const declaredHere = propDeclaration?.getSourceFile().fileName.startsWith(srcDir) ?? false
          const isDestructured = defaults.has(propName)
          if (!declaredHere && !isDestructured && !documentedHere.has(propName)) continue

          const resolved = checker.getTypeOfSymbolAtLocation(prop, propDeclaration ?? param ?? declaration)
          const union = literalUnionText(resolved, checker)
          const single = propDeclaration && prop.declarations.length === 1 && ts.isPropertySignature(propDeclaration)
          const raw =
            union ??
            (single && propDeclaration.type
              ? propDeclaration.type.getText()
              : checker.typeToString(
                  resolved,
                  undefined,
                  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias
                ))

          props.push({
            name: propName,
            type: cleanTypeText(raw),
            required: !(prop.flags & ts.SymbolFlags.Optional),
            default: defaults.get(propName) ?? null,
            description: propDeclaration ? jsdocOf(prop, checker) : "",
            inherited: !declaredHere && !isDestructured,
          })
        }
      }

      // Las heredadas van después de las propias: la tabla se lee de lo más
      // específico del paquete a lo que viene de Base UI.
      props.sort((a, b) => {
        if (a.required !== b.required) return a.required ? -1 : 1
        if (a.inherited !== b.inherited) return a.inherited ? 1 : -1
        if (a.name === "className") return 1
        if (b.name === "className") return -1
        return a.name.localeCompare(b.name)
      })

      components.push({
        name,
        description: jsdocOf(symbol, checker),
        bases: basesFromTypeText(annotation || aliasText),
        alias: !param ? cleanTypeText(aliasText) : null,
        props,
      })
    }

    result.set(slug, components)
  }

  return result
}

/** Lee `src/index.ts` y devuelve los slugs de componente en orden de export. */
export function componentSlugs(root) {
  const index = readFileSync(join(root, "src/index.ts"), "utf8")
  return [...index.matchAll(/export \* from "\.\/components\/([a-z0-9-]+)\.js"/g)].map(([, slug]) => slug).sort()
}
