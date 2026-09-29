import { act, render, screen } from "@testing-library/react"
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

  it("con Espacio también copia", async () => {
    const user = userEvent.setup()
    render(<CopyButton value="F-0012" />)
    await user.tab()
    await user.keyboard(" ")
    expect(await navigator.clipboard.readText()).toBe("F-0012")
  })

  it("a los 1,5 s vuelve al ícono de copiar y la región viva se vacía", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<CopyButton value="F-0012" />)
    await user.click(screen.getByRole("button", { name: "Copiar" }))
    expect(status()).toHaveTextContent("Copiado")
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
