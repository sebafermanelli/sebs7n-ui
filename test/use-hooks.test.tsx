import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useKeySequence } from "../src/lib/use-key-sequence"
import { useStoredState } from "../src/lib/use-stored-state"

const isView = (value: unknown): value is "list" | "grid" => value === "list" || value === "grid"

describe("useStoredState", () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it("arranca con el valor inicial y adopta el guardado después de montar", () => {
    localStorage.setItem("view", JSON.stringify("grid"))
    const { result } = renderHook(() => useStoredState("view", "list", isView))
    expect(result.current[0]).toBe("grid")
  })

  it("el primer render es el inicial (no desfasa la hidratación)", () => {
    localStorage.setItem("view", JSON.stringify("grid"))
    const seen: string[] = []
    function Probe() {
      const [value] = useStoredState("view", "list", isView)
      seen.push(value)
      return null
    }
    render(<Probe />)
    expect(seen[0]).toBe("list")
    expect(seen.at(-1)).toBe("grid")
  })

  it("al cambiar de clave adopta lo guardado en la nueva, o el inicial si no hay nada", () => {
    localStorage.setItem("a", JSON.stringify("grid"))
    const { result, rerender } = renderHook(({ k }) => useStoredState(k, "list", isView), { initialProps: { k: "a" } })
    expect(result.current[0]).toBe("grid")
    rerender({ k: "b" })
    expect(result.current[0]).toBe("list")
    localStorage.setItem("b", JSON.stringify("grid"))
    rerender({ k: "c" })
    rerender({ k: "b" })
    expect(result.current[0]).toBe("grid")
  })

  it("guarda lo que se elige", () => {
    const { result } = renderHook(() => useStoredState("view", "list", isView))
    act(() => result.current[1]("grid"))
    expect(result.current[0]).toBe("grid")
    expect(localStorage.getItem("view")).toBe('"grid"')
  })

  it("descarta lo guardado que no valida y el JSON roto", () => {
    localStorage.setItem("view", JSON.stringify("tabla"))
    const { result, unmount } = renderHook(() => useStoredState("view", "list", isView))
    expect(result.current[0]).toBe("list")
    unmount()
    localStorage.setItem("view", "{roto")
    expect(renderHook(() => useStoredState("view", "list", isView)).result.current[0]).toBe("list")
  })

  it("sin almacenamiento anda igual, sin recordar", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado")
    })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("bloqueado")
    })
    const { result } = renderHook(() => useStoredState("view", "list", isView))
    act(() => result.current[1]("grid"))
    expect(result.current[0]).toBe("grid")
  })
})

describe("useKeySequence", () => {
  afterEach(() => vi.useRealTimers())

  function Harness({ onHelp, onGo, enabled }: { onHelp: () => void; onGo: () => void; enabled?: boolean }) {
    useKeySequence({ "?": onHelp, "g f": onGo }, { enabled })
    return <input aria-label="Campo" />
  }

  it("una tecla suelta", async () => {
    const user = userEvent.setup()
    const onHelp = vi.fn()
    render(<Harness onGo={() => {}} onHelp={onHelp} />)
    await user.keyboard("?")
    expect(onHelp).toHaveBeenCalledTimes(1)
  })

  it("una secuencia de dos teclas", async () => {
    const user = userEvent.setup()
    const onGo = vi.fn()
    render(<Harness onGo={onGo} onHelp={() => {}} />)
    await user.keyboard("gf")
    expect(onGo).toHaveBeenCalledTimes(1)
  })

  it("la secuencia vence: pasado el tiempo, la «f» sola no navega", () => {
    vi.useFakeTimers()
    const onGo = vi.fn()
    render(<Harness onGo={onGo} onHelp={() => {}} />)
    fireEvent.keyDown(window, { key: "g" })
    vi.advanceTimersByTime(2000)
    fireEvent.keyDown(window, { key: "f" })
    expect(onGo).not.toHaveBeenCalled()
  })

  it("una tecla que no continúa la secuencia la reinicia", () => {
    const onGo = vi.fn()
    render(<Harness onGo={onGo} onHelp={() => {}} />)
    fireEvent.keyDown(window, { key: "g" })
    fireEvent.keyDown(window, { key: "x" })
    fireEvent.keyDown(window, { key: "f" })
    expect(onGo).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: "g" })
    fireEvent.keyDown(window, { key: "g" })
    fireEvent.keyDown(window, { key: "f" })
    expect(onGo).toHaveBeenCalledTimes(1)
  })

  it("no dispara con ⌘, Ctrl o Alt", () => {
    const onHelp = vi.fn()
    render(<Harness onGo={() => {}} onHelp={onHelp} />)
    fireEvent.keyDown(window, { key: "?", metaKey: true })
    fireEvent.keyDown(window, { key: "?", ctrlKey: true })
    fireEvent.keyDown(window, { key: "?", altKey: true })
    expect(onHelp).not.toHaveBeenCalled()
  })

  it("no dispara mientras se escribe en un campo", async () => {
    const user = userEvent.setup()
    const onHelp = vi.fn()
    render(<Harness onGo={() => {}} onHelp={onHelp} />)
    await user.click(screen.getByLabelText("Campo"))
    await user.keyboard("?")
    expect(onHelp).not.toHaveBeenCalled()
  })

  it("enabled={false} no escucha", () => {
    const onHelp = vi.fn()
    render(<Harness enabled={false} onGo={() => {}} onHelp={onHelp} />)
    fireEvent.keyDown(window, { key: "?" })
    expect(onHelp).not.toHaveBeenCalled()
  })

  it("el handler más nuevo es el que corre, sin volver a registrar", () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<Harness onGo={() => {}} onHelp={first} />)
    rerender(<Harness onGo={() => {}} onHelp={second} />)
    fireEvent.keyDown(window, { key: "?" })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
