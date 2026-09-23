// El generador de props es el que puede romperse en silencio: si un cambio de
// TypeScript o del código del paquete hace que deje de encontrar una prop, la
// tabla queda vacía y el sitio igual compila. Estos casos son los patrones que
// usa sebs7n-ui, uno por cada forma de declarar props.
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { basesFromTypeText, cleanTypeText, componentSlugs, extractProps } from "../scripts/lib/props.mjs"

const root = fileURLToPath(new URL("../../..", import.meta.url))
const slugs = componentSlugs(root)
const extracted = extractProps({
  root,
  files: ["button", "card", "table", "combobox", "dialog", "badge", "sidebar", "kbd"].map(
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
  it("encuentra los 43 componentes del barrel", () => {
    expect(slugs).toHaveLength(43)
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
    expect(content.props.map((entry) => entry.name).sort()).toEqual(["className", "showCloseButton"])
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
