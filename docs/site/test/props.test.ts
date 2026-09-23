// El generador de props es el que puede romperse en silencio: si un cambio de
// TypeScript o del código del paquete hace que deje de encontrar una prop, la
// tabla queda vacía y el sitio igual compila. Estos casos son los patrones que
// usa sebs7n-ui, uno por cada forma de declarar props.
import { readdirSync } from "node:fs"
import { basename, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { basesFromTypeText, cleanTypeText, componentSlugs, extractProps } from "../scripts/lib/props.mjs"

const root = fileURLToPath(new URL("../../..", import.meta.url))
const slugs = componentSlugs(root)
const extracted = extractProps({
  root,
  files: ["button", "card", "table", "combobox", "dialog", "badge", "sidebar", "kbd", "select"].map(
    (slug) => `src/components/${slug}.tsx`
  ),
})

const find = (slug: string, name: string) => {
  const exported = extracted.get(slug)?.find((entry) => entry.name === name)
  if (!exported) throw new Error(`No se extrajo ${name} de ${slug}`)
  return exported
}
const prop = (slug: string, name: string, propName: string) => {
  const found = find(slug, name).props.find((entry) => entry.name === propName)
  if (!found) throw new Error(`No se extrajo la prop ${propName} de ${name}`)
  return found
}

describe("basesFromTypeText", () => {
  it("reconoce los elementos HTML", () => {
    expect(basesFromTypeText('React.ComponentProps<"div"> & { x?: 1 }')).toEqual(["<div>"])
    expect(basesFromTypeText('Omit<useRender.ComponentProps<"a">, "className">')).toEqual(["<a>"])
  })

  it("reconoce los primitivos de Base UI y les saca el sufijo", () => {
    expect(basesFromTypeText('Omit<MenuPrimitive.Popup.Props, "className">')).toEqual(["Menu.Popup"])
    expect(basesFromTypeText("ButtonPrimitive.Props & X")).toEqual(["Button"])
  })

  it("reconoce un alias directo, pero no lo duplica con la forma .Props", () => {
    expect(basesFromTypeText("ComboboxPrimitive.Root")).toEqual(["Combobox.Root"])
    expect(basesFromTypeText("DialogPrimitive.Root.Props")).toEqual(["Dialog.Root"])
  })
})

describe("cleanTypeText", () => {
  it("saca undefined, null e import() del tipo impreso", () => {
    expect(cleanTypeText('"sm" | "md" | undefined')).toBe('"sm" | "md"')
    expect(cleanTypeText('import("/x/y").Side')).toBe("Side")
    expect(cleanTypeText("string  |\n  number")).toBe("string | number")
  })
})

describe("extractProps", () => {
  // Sin número a mano: el barrel tiene que exportar exactamente los archivos que
  // hay en src/components. Un componente nuevo sin su `export *` falla acá.
  it("el barrel exporta todos los componentes, y nada más", () => {
    const archivos = readdirSync(join(root, "src/components"))
      .filter((archivo) => archivo.endsWith(".tsx"))
      .map((archivo) => basename(archivo, ".tsx"))
      .sort()
    expect(slugs).toEqual(archivos)
  })

  it("rescata las variantes de cva, que declaran en node_modules pero son props del componente", () => {
    expect(prop("button", "Button", "variant").type).toContain('"accent"')
    expect(prop("button", "Button", "size").type).toContain('"icon-lg"')
    expect(prop("button", "Button", "shape").type).toBe('"default" | "pill"')
  })

  it("lee el valor por defecto del patrón de desestructuración", () => {
    expect(prop("button", "Button", "loading").default).toBe("false")
    expect(prop("card", "Card", "size").default).toBe('"md"')
    expect(prop("table", "Table", "density").default).toBe('"default"')
    expect(prop("combobox", "ComboboxContent", "sideOffset").default).toBe("6")
  })

  it("marca lo obligatorio y lo opcional", () => {
    expect(prop("button", "Button", "loading").required).toBe(false)
    expect(find("button", "Button").props.every((entry) => !entry.required)).toBe(true)
  })

  it("expande una unión de literales aunque venga de un alias", () => {
    // `color?: BadgeColor` — el tipo por nombre no sirve en una tabla.
    expect(prop("badge", "Badge", "color").type).toContain('"purple"')
    // Unión discriminada: variant es "subtle" | "solid", no solo el primer constituyente.
    expect(prop("badge", "Badge", "variant").type).toBe('"subtle" | "solid"')
  })

  it("descarta las props heredadas del primitivo y deja la línea de herencia", () => {
    const content = find("dialog", "DialogContent")
    expect(content.bases).toEqual(["Dialog.Popup"])
    expect(content.props.map((entry) => entry.name).sort()).toEqual(["className", "labels", "showCloseButton"])
  })

  // `WithClassName<P>` reemplaza las 110 copias de `Omit<P, "className"> & { className?: string }`.
  // El generador lee el **texto** del tipo para la línea «hereda de» y mira dónde está declarada
  // cada prop para decidir si es propia: los dos dependen de que el alias no tape nada. Si el día
  // de mañana un cambio hace que `WithClassName` se lea como un tipo opaco, las tablas del sitio
  // se vacían y el build sigue verde, así que esto se fija acá.
  it("expande WithClassName: la línea de herencia y el className propio sobreviven al alias", () => {
    const overlay = find("dialog", "DialogOverlay")
    expect(overlay.bases).toEqual(["Dialog.Backdrop"])
    const className = prop("dialog", "DialogOverlay", "className")
    expect(className.type).toBe("string")
    expect(className.inherited).toBe(false)
    // Y las props de Base UI que el alias deja pasar siguen sin ensuciar la tabla.
    expect(overlay.props.map((entry) => entry.name)).toEqual(["className"])
  })

  it("resuelve un componente que es un alias del primitivo", () => {
    const combobox = find("combobox", "Combobox")
    expect(combobox.alias).toBe("ComboboxPrimitive.Root")
    expect(combobox.bases).toEqual(["Combobox.Root"])
  })

  it("conserva el JSDoc en español que escribió el paquete", () => {
    expect(prop("sidebar", "Sidebar", "collapsed").description).toContain("Solo íconos")
  })

  it("no deja componentes sin exportar ni tipos colados como componentes", () => {
    expect(extracted.get("kbd")?.map((entry) => entry.name)).toEqual(["Kbd"])
    expect(find("card", "CardTitle").bases).toEqual(["<div>"])
  })

  // Antes, escribir la descripción de `items` en meta.mjs no hacía nada: el
  // generador solo iteraba props propias y `items` es del primitivo de Base UI.
  // Son justo las props que hacen al componente.
  it("vuelca las props heredadas que meta.mjs describe, marcadas y con el tipo del primitivo", () => {
    const conDocumentadas = extractProps({
      root,
      files: ["src/components/select.tsx"],
      documented: (slug, component) => (slug === "select" && component === "Select" ? ["items"] : []),
    })
    const select = conDocumentadas.get("select")!.find((entry) => entry.name === "Select")!
    const items = select.props.find((entry) => entry.name === "items")!
    expect(items.inherited).toBe(true)
    expect(items.type).toContain("label")
    // Sin `documented` no aparece: la tabla sigue siendo la de las props propias.
    expect(find("select", "Select").props.some((entry) => entry.name === "items")).toBe(false)
  })

  it("nunca devuelve un tipo vacío", () => {
    for (const [slug, exports] of extracted) {
      for (const exported of exports) {
        for (const entry of exported.props) {
          expect(entry.type, `${slug}.${exported.name}.${entry.name}`).not.toBe("")
        }
      }
    }
  })
})
