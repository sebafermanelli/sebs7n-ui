import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  addWidget,
  cleanIds,
  defaultWidgetIds,
  isWidgetLayout,
  moveWidget,
  parseLayout,
  removeWidget,
  reorderWidgets,
  serializeLayout,
  useWidgetLayout,
  type WidgetDef
} from "../src/lib/widget-layout"

const KNOWN = ["a", "b", "c", "d"]
const widgets: WidgetDef[] = KNOWN.map((id) => ({ id, title: id.toUpperCase(), render: () => id }))

describe("widget-layout: lógica pura", () => {
  it("moveWidget mueve un id y acota a los extremos", () => {
    expect(moveWidget(KNOWN, "a", 2)).toEqual(["b", "c", "a", "d"])
    expect(moveWidget(KNOWN, "d", 0)).toEqual(["d", "a", "b", "c"])
    expect(moveWidget(KNOWN, "b", 99)).toEqual(["a", "c", "d", "b"])
    expect(moveWidget(KNOWN, "b", -5)).toEqual(["b", "a", "c", "d"])
    expect(moveWidget(KNOWN, "z", 1)).toEqual(KNOWN)
  })

  it("reorderWidgets acepta el orden del arrastre solo si son los mismos ids", () => {
    expect(reorderWidgets(KNOWN, ["d", "a", "b", "c"])).toEqual(["d", "a", "b", "c"])
    expect(reorderWidgets(KNOWN, ["a", "b", "c"])).toEqual(KNOWN)
    expect(reorderWidgets(KNOWN, ["a", "a", "b", "c"])).toEqual(KNOWN)
    expect(reorderWidgets(KNOWN, ["a", "b", "c", "x"])).toEqual(KNOWN)
  })

  it("removeWidget saca; addWidget suma al final solo lo conocido y que no esté", () => {
    expect(removeWidget(KNOWN, "b")).toEqual(["a", "c", "d"])
    expect(removeWidget(KNOWN, "z")).toEqual(KNOWN)
    expect(addWidget(["a", "c"], "b", KNOWN)).toEqual(["a", "c", "b"])
    expect(addWidget(["a", "c"], "c", KNOWN)).toEqual(["a", "c"])
    expect(addWidget(["a"], "zzz", KNOWN)).toEqual(["a"])
  })

  it("las funciones no mutan lo que reciben", () => {
    const ids = Object.freeze([...KNOWN]) as readonly string[]
    expect(() => {
      moveWidget(ids, "a", 3)
      removeWidget(ids, "a")
      addWidget(ids.slice(1), "a", KNOWN)
      reorderWidgets(ids, ["d", "c", "b", "a"])
    }).not.toThrow()
    expect(ids).toEqual(KNOWN)
  })

  it("defaultWidgetIds es el orden original", () => {
    expect(defaultWidgetIds(widgets)).toEqual(KNOWN)
  })

  it("serializa con versión y parsea descartando lo que ya no existe y los repetidos", () => {
    const data = serializeLayout(["c", "a"])
    expect(data).toEqual({ version: 1, ids: ["c", "a"] })
    expect(JSON.parse(JSON.stringify(data))).toEqual(data)
    expect(parseLayout({ version: 1, ids: ["c", "gone", "a", "c"] }, KNOWN)).toEqual(["c", "a"])
    expect(parseLayout({ version: 2, ids: ["a"] }, KNOWN)).toBeNull()
    expect(parseLayout("a,b", KNOWN)).toBeNull()
    expect(parseLayout({ version: 1, ids: [1] }, KNOWN)).toBeNull()
    expect(cleanIds(["x", "b", "b"], KNOWN)).toEqual(["b"])
  })

  it("isWidgetLayout valida la forma", () => {
    expect(isWidgetLayout({ version: 1, ids: [] })).toBe(true)
    expect(isWidgetLayout(null)).toBe(false)
    expect(isWidgetLayout({ version: 1 })).toBe(false)
  })
})

describe("useWidgetLayout", () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())
  const layout = (storageKey = "test:widgets") => renderHook(() => useWidgetLayout({ storageKey, widgets }))
  const ids = (result: { current: ReturnType<typeof useWidgetLayout> }) => result.current.visible.map((widget) => widget.id)

  it("arranca con el panel original y sin edición", () => {
    const { result } = layout()
    expect(ids(result)).toEqual(KNOWN)
    expect(result.current.hidden).toEqual([])
    expect(result.current.isDefault).toBe(true)
    expect(result.current.editing).toBe(false)
    expect(result.current.armed).toBe(false)
  })

  it("quita, agrega y reordena, y lo guarda", () => {
    const { result } = layout()
    act(() => result.current.remove("b"))
    expect(ids(result)).toEqual(["a", "c", "d"])
    expect(result.current.hidden.map((widget) => widget.id)).toEqual(["b"])
    expect(result.current.isDefault).toBe(false)
    act(() => result.current.reorder(["d", "c", "a"]))
    expect(ids(result)).toEqual(["d", "c", "a"])
    act(() => result.current.add("b"))
    expect(ids(result)).toEqual(["d", "c", "a", "b"])
    expect(JSON.parse(localStorage.getItem("test:widgets")!)).toEqual({ version: 1, ids: ["d", "c", "a", "b"] })
  })

  it("adopta lo guardado después de montar y descarta lo desconocido", () => {
    localStorage.setItem("test:widgets", JSON.stringify({ version: 1, ids: ["c", "gone", "a"] }))
    const { result } = layout()
    expect(ids(result)).toEqual(["c", "a"])
    expect(result.current.hidden.map((widget) => widget.id)).toEqual(["b", "d"])
  })

  it("ignora lo guardado con otro formato", () => {
    localStorage.setItem("test:widgets", JSON.stringify(["c"]))
    expect(ids(layout().result)).toEqual(KNOWN)
  })

  it("restablece el orden original, lo guarda y lo anuncia", () => {
    const { result } = layout()
    act(() => result.current.remove("a"))
    act(() => result.current.reset())
    expect(ids(result)).toEqual(KNOWN)
    expect(result.current.isDefault).toBe(true)
    expect(result.current.message).toBe("Se restableció el panel original.")
    expect(JSON.parse(localStorage.getItem("test:widgets")!).ids).toEqual(KNOWN)
  })

  it("editar: arma el módulo de edición, anuncia al entrar y cierra el catálogo al salir", () => {
    const { result } = layout()
    act(() => result.current.setEditing(true))
    expect(result.current.editing).toBe(true)
    expect(result.current.armed).toBe(true)
    expect(result.current.message).toMatch(/^Modo edición/)
    act(() => result.current.setCatalogOpen(true))
    act(() => result.current.setEditing(false))
    expect(result.current.editing).toBe(false)
    expect(result.current.armed).toBe(true)
    expect(result.current.catalogOpen).toBe(false)
    expect(result.current.message).toBe("")
  })

  it("openCatalog entra en edición y abre el catálogo", () => {
    const { result } = layout()
    act(() => result.current.openCatalog())
    expect(result.current.editing).toBe(true)
    expect(result.current.catalogOpen).toBe(true)
  })
})
