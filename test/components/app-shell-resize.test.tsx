import { act, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AppShell, useAppShell } from "../../src/components/app-shell"
import { Sidebar, SidebarContent, SidebarItem } from "../../src/components/sidebar"

// El shell decide por matchMedia (≥ lg) y mide contra su propio contenedor (ResizeObserver), no contra la ventana.
let desktop = true
const originalMatchMedia = window.matchMedia
const originalRO = globalThis.ResizeObserver
beforeEach(() => {
  desktop = true
  localStorage.clear()
  window.matchMedia = ((query: string) => ({
    get matches() {
      return desktop
    },
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  Element.prototype.setPointerCapture = () => {}
})
afterEach(() => {
  window.matchMedia = originalMatchMedia
  globalThis.ResizeObserver = originalRO
})

function Toggle() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppShell()
  return (
    <button type="button" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
      {sidebarCollapsed ? "rail" : "ancho"}
    </button>
  )
}

function Example(props: Partial<React.ComponentProps<typeof AppShell>>) {
  return (
    <AppShell
      sidebar={
        <Sidebar>
          <SidebarContent>
            <SidebarItem href="/a" icon={<span />}>
              Inicio
            </SidebarItem>
          </SidebarContent>
        </Sidebar>
      }
      aside={<p>Panel</p>}
      asideLabel="Asistente"
      header={<Toggle />}
      {...props}
    >
      <p>Contenido</p>
    </AppShell>
  )
}

const handle = () => screen.getByRole("separator", { name: "Cambiar el ancho de la barra lateral" })
const wrapper = () => document.querySelector<HTMLElement>("[data-slot=app-shell-sidebar]")!
const sidebar = () => document.querySelector<HTMLElement>("[data-slot=sidebar]")!
const width = () => wrapper().style.getPropertyValue("--sidebar-width")

// El panel se mide contra su padre: jsdom no tiene layout, así que el test fija dónde está.
function frame(el: Element, rect: Partial<DOMRect>) {
  el.getBoundingClientRect = () => ({ left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}), ...rect }) as DOMRect
}
function drag(el: Element, xs: number[]) {
  fireEvent.pointerDown(el, { pointerId: 1, button: 0, clientX: 256 })
  for (const x of xs) fireEvent.pointerMove(el, { pointerId: 1, clientX: x })
  fireEvent.pointerUp(el, { pointerId: 1 })
}

describe("AppShell: sidebar redimensionable", () => {
  it("por defecto: un separador vertical con sus valores, que controla al sidebar, y 256 de ancho", () => {
    render(<Example />)
    const separator = handle()
    expect(separator).toHaveAttribute("aria-orientation", "vertical")
    expect(separator).toHaveAttribute("aria-valuenow", "256")
    expect(separator).toHaveAttribute("aria-valuemin", "200")
    expect(separator).toHaveAttribute("aria-valuemax", "360")
    expect(separator).toHaveAttribute("tabindex", "0")
    expect(separator).toHaveClass("cursor-col-resize", "w-2", "focus-visible:after:bg-brand-500")
    expect(separator.getAttribute("aria-controls")).toBe(wrapper().id)
    expect(width()).toBe("256px")
    expect(sidebar()).not.toHaveAttribute("data-collapsed")
  })

  it("arrastrar con el puntero cambia el ancho, medido contra el shell, y respeta mínimo y máximo", () => {
    const onWidth = vi.fn()
    render(<Example onSidebarWidthChange={onWidth} />)
    // El shell está corrido 100 px de la ventana: el ancho es clientX - left del sidebar.
    frame(wrapper(), { left: 100 })
    const separator = handle()
    fireEvent.pointerDown(separator, { pointerId: 1, button: 0, clientX: 356 })
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 400 })
    expect(separator).toHaveAttribute("aria-valuenow", "300")
    expect(width()).toBe("300px")
    expect(wrapper()).toHaveAttribute("data-resizing")
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 900 })
    expect(width()).toBe("360px")
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 260 }) // 160: sobre el umbral, pero bajo el mínimo
    expect(width()).toBe("200px")
    expect(sidebar()).not.toHaveAttribute("data-collapsed")
    expect(onWidth).not.toHaveBeenCalled()
    fireEvent.pointerUp(separator, { pointerId: 1 })
    expect(wrapper()).not.toHaveAttribute("data-resizing")
    expect(onWidth).toHaveBeenCalledWith(200)
  })

  it("por debajo del umbral (140) pliega al riel, y desde el riel arrastrar hacia afuera lo despliega", () => {
    const onCollapsed = vi.fn()
    render(<Example onSidebarCollapsedChange={onCollapsed} />)
    frame(wrapper(), { left: 0 })
    drag(handle(), [300, 139])
    expect(sidebar()).toHaveAttribute("data-collapsed")
    expect(onCollapsed).toHaveBeenCalledWith(true)
    expect(handle()).toHaveAttribute("aria-valuenow", "64")
    // El ancho de antes se conserva: al volver, vuelve a ese.
    drag(handle(), [150, 320])
    expect(sidebar()).not.toHaveAttribute("data-collapsed")
    expect(width()).toBe("320px")
    expect(onCollapsed).toHaveBeenLastCalledWith(false)
  })

  it("doble clic y Enter alternan plegado y desplegado", () => {
    render(<Example />)
    fireEvent.doubleClick(handle())
    expect(sidebar()).toHaveAttribute("data-collapsed")
    fireEvent.keyDown(handle(), { key: "Enter" })
    expect(sidebar()).not.toHaveAttribute("data-collapsed")
    expect(width()).toBe("256px")
  })

  it("teclado: flechas ±16, Shift ±48, Inicio mínimo, Fin máximo; desde el riel, avanzar despliega", () => {
    const onWidth = vi.fn()
    render(<Example onSidebarWidthChange={onWidth} />)
    const separator = handle()
    fireEvent.keyDown(separator, { key: "ArrowRight" })
    expect(separator).toHaveAttribute("aria-valuenow", "272")
    fireEvent.keyDown(separator, { key: "ArrowLeft", shiftKey: true })
    expect(separator).toHaveAttribute("aria-valuenow", "224")
    fireEvent.keyDown(separator, { key: "End" })
    expect(separator).toHaveAttribute("aria-valuenow", "360")
    fireEvent.keyDown(separator, { key: "Home" })
    expect(separator).toHaveAttribute("aria-valuenow", "200")
    fireEvent.keyDown(separator, { key: "ArrowLeft" }) // el mínimo no pliega con las flechas
    expect(separator).toHaveAttribute("aria-valuenow", "200")
    expect(onWidth).toHaveBeenLastCalledWith(200)
    fireEvent.keyDown(separator, { key: "Enter" })
    expect(sidebar()).toHaveAttribute("data-collapsed")
    fireEvent.keyDown(separator, { key: "ArrowRight" })
    expect(sidebar()).not.toHaveAttribute("data-collapsed")
  })

  it("useAppShell expone sidebarCollapsed y setSidebarCollapsed (el atajo ⌘B de las apps)", () => {
    render(<Example />)
    const button = screen.getByRole("button", { name: "ancho" })
    fireEvent.click(button)
    expect(sidebar()).toHaveAttribute("data-collapsed")
    expect(screen.getByRole("button", { name: "rail" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "rail" }))
    expect(sidebar()).not.toHaveAttribute("data-collapsed")
  })

  it("controlado: sidebarWidth y sidebarCollapsed mandan; el shell solo avisa", () => {
    const onWidth = vi.fn()
    render(<Example sidebarWidth={300} sidebarCollapsed={false} onSidebarWidthChange={onWidth} />)
    expect(width()).toBe("300px")
    fireEvent.keyDown(handle(), { key: "ArrowRight" })
    expect(onWidth).toHaveBeenCalledWith(316)
    expect(width()).toBe("300px")
  })

  it("defaults propios: defaultSidebarWidth, defaultSidebarCollapsed y límites", () => {
    render(<Example defaultSidebarWidth={500} sidebarMaxWidth={320} sidebarMinWidth={240} defaultSidebarCollapsed />)
    expect(sidebar()).toHaveAttribute("data-collapsed")
    fireEvent.keyDown(handle(), { key: "End" })
    expect(handle()).toHaveAttribute("aria-valuenow", "320")
    expect(handle()).toHaveAttribute("aria-valuemin", "240")
  })

  it("en angosto (< lg) no hay separador: el sidebar es una capa", () => {
    desktop = false
    render(<Example />)
    expect(screen.queryByRole("separator")).toBeNull()
  })

  it("sidebarResizable={false}: sin separador, pero el plegado por contexto sigue andando", () => {
    render(<Example sidebarResizable={false} />)
    expect(screen.queryByRole("separator", { name: "Cambiar el ancho de la barra lateral" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "ancho" }))
    expect(sidebar()).toHaveAttribute("data-collapsed")
  })

  it("sidebarStorageKey: recuerda ancho y plegado, y los adopta recién después de montar", async () => {
    const { unmount } = render(<Example sidebarStorageKey="t:sidebar" />)
    fireEvent.keyDown(handle(), { key: "End" })
    fireEvent.click(screen.getByRole("button", { name: "ancho" }))
    expect(JSON.parse(localStorage.getItem("t:sidebar")!)).toEqual({ w: 360, c: true })
    unmount()
    render(<Example sidebarStorageKey="t:sidebar" />)
    await act(async () => {})
    expect(sidebar()).toHaveAttribute("data-collapsed")
    fireEvent.click(screen.getByRole("button", { name: "rail" }))
    expect(width()).toBe("360px")
  })

  it("lo guardado que no sirve se descarta; sin clave no se escribe nada", async () => {
    localStorage.setItem("t:roto", JSON.stringify({ w: "ancho" }))
    render(<Example sidebarStorageKey="t:roto" />)
    await act(async () => {})
    expect(width()).toBe("256px")
    fireEvent.keyDown(handle(), { key: "End" })
    const keys = Object.keys(localStorage)
    expect(keys).toEqual(["t:roto"])
  })

  it("el HTML del servidor sale con el ancho por defecto y desplegado, aunque haya algo guardado", async () => {
    localStorage.setItem("t:ssr", JSON.stringify({ w: 340, c: true }))
    const { renderToString } = await import("react-dom/server")
    const html = renderToString(<Example sidebarStorageKey="t:ssr" />)
    expect(html).toContain("--sidebar-width:256px")
    expect(html).not.toContain(`data-collapsed=""`)
    expect(html).not.toContain('role="separator"')
  })
})

describe("AppShell: panel lateral", () => {
  const column = () => document.querySelector<HTMLElement>("[data-slot=app-shell-aside-column]")!
  const asideHandle = () => screen.getByRole("separator", { name: "Cambiar el ancho del panel" })

  it("arrastrar con el puntero mide contra el borde del panel y respeta los límites", () => {
    const onWidth = vi.fn()
    render(<Example defaultAsideOpen onAsideWidthChange={onWidth} />)
    const separator = asideHandle()
    frame(separator.parentElement!, { right: 1000 })
    expect(separator).toHaveAttribute("aria-controls", separator.parentElement!.id)
    fireEvent.pointerDown(separator, { pointerId: 1, button: 0, clientX: 600 })
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 500 })
    expect(column().style.width).toBe("500px")
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 100 })
    expect(column().style.width).toBe("640px")
    fireEvent.pointerMove(separator, { pointerId: 1, clientX: 900 })
    expect(column().style.width).toBe("320px")
    fireEvent.pointerUp(separator, { pointerId: 1 })
    expect(onWidth).toHaveBeenCalledWith(320)
  })

  it("doble clic (o Enter) restaura el ancho por defecto", () => {
    render(<Example defaultAsideOpen asideWidth={420} />)
    fireEvent.keyDown(asideHandle(), { key: "End" })
    expect(column().style.width).toBe("320px")
    fireEvent.doubleClick(asideHandle())
    expect(column().style.width).toBe("420px")
  })

  it("asideStorageKey: el shell recuerda el ancho", async () => {
    const { unmount } = render(<Example defaultAsideOpen asideStorageKey="t:aside" />)
    fireEvent.keyDown(asideHandle(), { key: "Home" })
    expect(JSON.parse(localStorage.getItem("t:aside")!).w).toBe(640)
    unmount()
    render(<Example defaultAsideOpen asideStorageKey="t:aside" />)
    await act(async () => {})
    expect(column().style.width).toBe("640px")
  })

  it("si el contenido quedaría bajo 480 px, el máximo baja; si ni el mínimo entra, es una hoja", async () => {
    let notify: (width: number) => void = () => {}
    globalThis.ResizeObserver = class {
      constructor(cb: (entries: unknown[]) => void) {
        notify = (width) => cb([{ contentRect: { width } }])
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    } as unknown as typeof ResizeObserver
    render(<Example defaultAsideOpen asideWidth={500} />)
    // 1100 - 256 (sidebar) - 480 = 364 para el panel.
    await act(async () => notify(1100))
    expect(column().style.width).toBe("364px")
    expect(asideHandle()).toHaveAttribute("aria-valuemax", "364")
    // 900 - 256 - 480 = 164 < 320: no entra, pasa a capa.
    await act(async () => notify(900))
    expect(document.querySelector("[data-slot=app-shell-aside]")).toBeNull()
    expect(column().style.width).toBe("0px")
  })

  it("en angosto no hay separador: el panel es una hoja", async () => {
    desktop = false
    render(<Example defaultAsideOpen />)
    await act(async () => {})
    expect(screen.queryByRole("separator")).toBeNull()
  })
})
