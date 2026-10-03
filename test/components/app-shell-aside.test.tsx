import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AppShell, useAppShell } from "../../src/components/app-shell"
import { LabelsProvider } from "../../src/lib/labels"

// El panel acoplado solo se monta ≥ lg: el test decide si el viewport es desktop.
let desktop = true
let listeners: Array<() => void> = []
const originalMatchMedia = window.matchMedia
beforeEach(() => {
  desktop = true
  listeners = []
  window.matchMedia = ((query: string) => ({
    get matches() {
      return desktop
    },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.push(cb),
    removeEventListener: (_: string, cb: () => void) => {
      listeners = listeners.filter((l) => l !== cb)
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

const Heavy = vi.fn(() => <input aria-label="Mensaje" />)

function Toggle() {
  const { asideOpen, setAsideOpen } = useAppShell()
  return (
    <button type="button" onClick={() => setAsideOpen(!asideOpen)}>
      Preguntar
    </button>
  )
}

function Example(props: Partial<React.ComponentProps<typeof AppShell>>) {
  return (
    <AppShell sidebar={<nav>Menú</nav>} aside={<Heavy />} asideLabel="Asistente" header={<Toggle />} {...props}>
      <button type="button">Acción de la página</button>
    </AppShell>
  )
}

describe("AppShell aside", () => {
  it("no monta el contenido mientras está cerrado", () => {
    Heavy.mockClear()
    render(<Example />)
    expect(Heavy).not.toHaveBeenCalled()
    expect(screen.queryByRole("complementary")).toBeNull()
  })

  it("abre como complementary con nombre, sin overlay ni modal, y deja operar el resto", async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole("button", { name: "Preguntar" }))
    const aside = await screen.findByRole("complementary", { name: "Asistente" })
    expect(aside).toHaveAttribute("data-slot", "app-shell-aside")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(document.querySelector("[data-slot=sheet-overlay]")).toBeNull()
    expect(document.body.style.overflow).not.toBe("hidden")
    const action = screen.getByRole("button", { name: "Acción de la página" })
    action.focus()
    expect(action).toHaveFocus()
  })

  it("el foco va al primer control del panel y vuelve al botón al cerrar con la X", async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = screen.getByRole("button", { name: "Preguntar" })
    await user.click(trigger)
    const close = await screen.findByRole("button", { name: "Cerrar panel" })
    await waitFor(() => expect(screen.getByRole("separator", { name: "Cambiar el ancho del panel" })).toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole("complementary").contains(document.activeElement)).toBe(true))
    await user.click(close)
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("Escape con el foco adentro lo cierra y devuelve el foco; no atrapa el foco", async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = screen.getByRole("button", { name: "Preguntar" })
    trigger.focus()
    await user.keyboard("{Enter}")
    const input = await screen.findByLabelText("Mensaje")
    input.focus()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(trigger).toHaveFocus())
    await waitFor(() => expect(screen.queryByRole("complementary")).toBeNull())
  })

  it("desmonta el contenido después de cerrar", async () => {
    const user = userEvent.setup()
    render(<Example defaultAsideOpen />)
    expect(await screen.findByLabelText("Mensaje")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Cerrar panel" }))
    await waitFor(() => expect(screen.queryByLabelText("Mensaje")).toBeNull())
  })

  it("controlado: avisa onAsideOpenChange y respeta asideOpen", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Example asideOpen onAsideOpenChange={onChange} />)
    await user.click(await screen.findByRole("button", { name: "Cerrar panel" }))
    expect(onChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole("complementary")).toBeInTheDocument()
  })

  it("los textos salen de labels (prop y provider) con default en español", async () => {
    const { unmount } = render(<Example asideLabel={undefined} defaultAsideOpen />)
    expect(await screen.findByRole("complementary", { name: "Panel lateral" })).toBeInTheDocument()
    expect(screen.getByRole("separator", { name: "Cambiar el ancho del panel" })).toBeInTheDocument()
    unmount()
    render(
      <LabelsProvider value={{ appShell: { closeAside: "Close panel" } }}>
        <Example defaultAsideOpen />
      </LabelsProvider>
    )
    expect(await screen.findByRole("button", { name: "Close panel" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cerrar panel" })).toBeNull()
  })

  it("empuja el contenido: la columna toma asideWidth y se puede redimensionar con el teclado", async () => {
    const onWidth = vi.fn()
    render(<Example defaultAsideOpen asideWidth={420} onAsideWidthChange={onWidth} />)
    const column = document.querySelector<HTMLElement>("[data-slot=app-shell-aside-column]")!
    expect(column.style.width).toBe("420px")
    const handle = await screen.findByRole("separator", { name: "Cambiar el ancho del panel" })
    expect(handle).toHaveAttribute("aria-valuenow", "420")
    fireEvent.keyDown(handle, { key: "ArrowLeft" })
    expect(handle).toHaveAttribute("aria-valuenow", "436")
    fireEvent.keyDown(handle, { key: "Home" })
    expect(handle).toHaveAttribute("aria-valuenow", "640")
    fireEvent.keyDown(handle, { key: "End" })
    expect(handle).toHaveAttribute("aria-valuenow", "320")
    expect(onWidth).toHaveBeenLastCalledWith(320)
    expect(column.style.width).toBe("320px")
  })

  it("el ancho inicial respeta mínimo y máximo", () => {
    render(<Example defaultAsideOpen asideWidth={900} asideMaxWidth={500} />)
    expect(document.querySelector<HTMLElement>("[data-slot=app-shell-aside-column]")!.style.width).toBe("500px")
  })

  it("< lg pasa a un Sheet modal", async () => {
    desktop = false
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole("button", { name: "Preguntar" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(await screen.findByLabelText("Mensaje")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=app-shell-aside]")).toBeNull()
  })
})
