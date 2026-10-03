import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CopyButton } from "../../src/components/copy-button"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const status = () => document.querySelector("[data-slot=copy-button-status]")

describe("CopyButton", () => {
  it("solo ícono: el botón plain de 28 con nombre «Copiar»", () => {
    render(<CopyButton value="30-71234567-8" />)
    const button = screen.getByRole("button", { name: "Copiar" })
    expect(button).toHaveAttribute("data-size", "icon-sm")
    // El tooltip no le cambia la identidad: sigue siendo un botón del sistema.
    expect(button).toHaveAttribute("data-slot", "button")
    expect(button).toHaveClass("size-7", "rounded-control", "text-brand-ink")
    expect(button).toHaveAttribute("type", "button")
  })

  it("con Enter copia, pasa a ✓, el tooltip dice «Copiado» y la región viva lo anuncia", async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(<CopyButton onCopy={onCopy} value="30-71234567-8" />)
    expect(status()).toHaveAttribute("role", "status")
    expect(status()).toHaveTextContent("")
    await user.tab()
    await user.keyboard("{Enter}")
    expect(await navigator.clipboard.readText()).toBe("30-71234567-8")
    expect(onCopy).toHaveBeenCalledWith("30-71234567-8")
    expect(status()).toHaveTextContent("Copiado")
    expect(await screen.findByText("Copiado", { selector: "[data-slot=tooltip-content]" })).toBeInTheDocument()
    expect(document.querySelector("svg.lucide-check")).not.toBeNull()
  })

  it("el tooltip se pide recién al apuntar o enfocar: antes no hay ninguno montado", async () => {
    const user = userEvent.setup()
    render(<CopyButton value="F-0012" />)
    expect(document.querySelector("[data-slot=tooltip-content]")).toBeNull()
    await user.hover(screen.getByRole("button", { name: "Copiar" }))
    expect(await screen.findByText("Copiar", { selector: "[data-slot=tooltip-content]" })).toBeInTheDocument()
    await user.unhover(screen.getByRole("button", { name: "Copiar" }))
    await vi.waitFor(() => expect(document.querySelector("[data-slot=tooltip-content]")).toBeNull())
  })

  it("con Espacio también copia", async () => {
    const user = userEvent.setup()
    render(<CopyButton value="F-0012" />)
    await user.tab()
    await user.keyboard(" ")
    expect(await navigator.clipboard.readText()).toBe("F-0012")
  })

  it("a los 1,5 s vuelve al ícono de copiar y la región viva se vacía", async () => {
    // El tooltip se carga con `import()` al copiar: se precarga ANTES de empezar a medir tiempo. Con el reloj
    // avanzando solo, en CI lento esa carga podía pasar los 1,5 s y el aviso ya estaba vacío al comprobarlo.
    await import("../../src/internal/copy-tip")
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<CopyButton value="F-0012" />)
    await user.click(screen.getByRole("button", { name: "Copiar" }))
    await waitFor(() => expect(status()).toHaveTextContent("Copiado"))
    await act(async () => {
      vi.advanceTimersByTime(1500)
    })
    expect(status()).toHaveTextContent("")
    expect(document.querySelector("svg.lucide-copy")).not.toBeNull()
  })

  it("si el portapapeles no deja copiar, lo dice en el tooltip y lo anuncia, sin ✓", async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denegado"))
    render(<CopyButton onCopy={onCopy} value="F-0012" />)
    await user.click(screen.getByRole("button", { name: "Copiar" }))
    expect(status()).toHaveTextContent("No se pudo copiar")
    expect(await screen.findByText("No se pudo copiar", { selector: "[data-slot=tooltip-content]" })).toBeInTheDocument()
    expect(document.querySelector("svg.lucide-copy")).not.toBeNull()
    expect(onCopy).not.toHaveBeenCalled()
  })

  it("con children: texto e ícono, nombrado por el texto; adentro de una fila no la abre", async () => {
    const user = userEvent.setup()
    const onRow = vi.fn()
    render(
      <div onClick={onRow}>
        <CopyButton value="a1b2c3d4-e5f6">a1b2c3d4</CopyButton>
      </div>
    )
    const button = screen.getByRole("button", { name: "a1b2c3d4" })
    expect(button).toHaveAttribute("data-size", "sm")
    expect(button).toHaveAttribute("data-slot", "button")
    await user.click(button)
    expect(await navigator.clipboard.readText()).toBe("a1b2c3d4-e5f6")
    expect(onRow).not.toHaveBeenCalled()
    expect(status()).toHaveTextContent("Copiado")
  })

  it("value vacío apaga el botón", () => {
    render(<CopyButton value="" />)
    expect(screen.getByRole("button", { name: "Copiar" })).toHaveAttribute("data-disabled")
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ copyButton: { copy: "Copy", copied: "Copied" } }}>
        <CopyButton value="uno" />
        <CopyButton labels={{ copy: "Copiar el CUIT" }} value="dos" />
      </LabelsProvider>
    )
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Copied")
    expect(screen.getByRole("button", { name: "Copiar el CUIT" })).toBeInTheDocument()
  })

  it("hidrata sin mismatch", async () => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(<CopyButton value="F-0012" />)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, <CopyButton value="F-0012" />, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
  })
})

describe("CopyButton variant=inline", () => {
  it("texto mono chico con ícono de 14, sin el alto de 28; mismo feedback", async () => {
    const user = userEvent.setup()
    render(
      <CopyButton aria-label="Copiar el ID 7f3a9c21" value="7f3a9c21-0000" variant="inline">
        7f3a9c21
      </CopyButton>
    )
    const button = screen.getByRole("button", { name: "Copiar el ID 7f3a9c21" })
    expect(button).toHaveAttribute("data-slot", "copy-button")
    expect(button).toHaveAttribute("data-variant", "inline")
    expect(button).toHaveAttribute("type", "button")
    expect(button).toHaveClass("font-mono", "text-footnote", "min-h-6", "[&_svg]:size-3.5", "text-label-secondary")
    expect(button).not.toHaveClass("h-7")
    expect(button).toHaveTextContent("7f3a9c21")
    await user.click(button)
    expect(await navigator.clipboard.readText()).toBe("7f3a9c21-0000")
    expect(status()).toHaveTextContent("Copiado")
    expect(await screen.findByText("Copiado", { selector: "[data-slot=tooltip-content]" })).toBeInTheDocument()
    expect(button.querySelector("svg.lucide-check")).not.toBeNull()
  })

  it("sin aria-label se llama «Copiar» y el valor: dice qué hace, no solo el dato", () => {
    render(<CopyButton value="F-0012" variant="inline" />)
    expect(screen.getByRole("button")).toHaveAccessibleName("Copiar F-0012")
  })

  it("sin children muestra el valor, y adentro de una fila clickeable no la abre", async () => {
    const user = userEvent.setup()
    const onRow = vi.fn()
    render(
      <div onClick={onRow}>
        <CopyButton value="F-0012" variant="inline" />
      </div>
    )
    const button = screen.getByRole("button", { name: "Copiar F-0012" })
    await user.click(button)
    expect(onRow).not.toHaveBeenCalled()
  })

  it("vacío se apaga", () => {
    render(<CopyButton value="" variant="inline" />)
    expect(document.querySelector("[data-slot=copy-button]")).toBeDisabled()
  })
})
