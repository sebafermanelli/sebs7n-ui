import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Chat,
  ChatDisclaimer,
  ChatEmpty,
  ChatError,
  ChatFooter,
  ChatHeader,
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSuggestion,
  ChatSuggestions,
  ChatTitle,
  ChatTyping,
} from "../../src/components/chat"
import { LabelsProvider } from "../../src/lib/labels"

const originalMatchMedia = window.matchMedia
const tactil = (si: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: si && query === "(pointer: coarse)",
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

const campo = () => screen.getByRole("textbox", { name: "Mensaje" })

describe("Chat: estructura", () => {
  it("no dibuja superficie: el vidrio lo pone quien lo contiene", () => {
    render(
      <Chat data-testid="chat">
        <ChatHeader>
          <ChatTitle>Asistente</ChatTitle>
        </ChatHeader>
        <ChatFooter>
          <ChatDisclaimer>Revisá los datos importantes.</ChatDisclaimer>
        </ChatFooter>
      </Chat>
    )
    const chat = screen.getByTestId("chat")
    expect(chat).toHaveClass("flex", "min-h-0", "flex-col")
    expect(chat.className).not.toMatch(/glass|bg-|shadow|border/)
    expect(screen.getByText("Asistente").closest("[data-slot=chat-header]")).toHaveClass("border-b", "border-gray-alpha-400")
    expect(screen.getByText("Revisá los datos importantes.")).toHaveClass("text-center", "text-label-12", "text-gray-900")
  })

  it("la lista es un log que se anuncia solo y se puede recorrer con el teclado", () => {
    const { rerender } = render(<ChatMessages>x</ChatMessages>)
    const lista = screen.getByRole("log", { name: "Conversación" })
    expect(lista).toHaveAttribute("aria-live", "polite")
    expect(lista).toHaveAttribute("aria-busy", "false")
    expect(lista).toHaveAttribute("tabindex", "0")
    expect(lista).toHaveClass("overflow-y-auto", "focus-visible:focus-ring")
    rerender(<ChatMessages busy>x</ChatMessages>)
    expect(lista).toHaveAttribute("aria-busy", "true")
  })
})

describe("ChatMessage", () => {
  it("el usuario va a la derecha en un globo con el tinte de marca; el asistente, a la izquierda y sin globo", () => {
    render(
      <>
        <ChatMessage from="user">¿Cuánto facturé?</ChatMessage>
        <ChatMessage from="assistant">$ 1.284.000.</ChatMessage>
      </>
    )
    const usuario = screen.getByText("¿Cuánto facturé?")
    expect(usuario).toHaveAttribute("data-from", "user")
    expect(usuario).toHaveClass("data-[from=user]:self-end", "data-[from=user]:bg-highlight", "data-[from=user]:rounded-br-control")
    const asistente = screen.getByText("$ 1.284.000.")
    expect(asistente).toHaveAttribute("data-from", "assistant")
    expect(asistente).toHaveClass("data-[from=assistant]:self-start")
    // Una palabra larga o una URL no rompen el ancho del panel.
    expect(usuario).toHaveClass("wrap-anywhere")
  })
})

describe("ChatMessages: sigue al último mensaje", () => {
  const medidas = (el: HTMLElement, m: { scrollHeight: number; clientHeight: number }) => {
    Object.defineProperty(el, "scrollHeight", { configurable: true, value: m.scrollHeight })
    Object.defineProperty(el, "clientHeight", { configurable: true, value: m.clientHeight })
  }

  it("mientras el usuario está abajo, baja con cada mensaje", () => {
    const { rerender } = render(<ChatMessages>uno</ChatMessages>)
    const lista = screen.getByRole("log")
    medidas(lista, { scrollHeight: 900, clientHeight: 300 })
    rerender(<ChatMessages>uno dos</ChatMessages>)
    expect(lista.scrollTop).toBe(900)
  })

  it("si subió a leer, no lo arrastra de vuelta", () => {
    const { rerender } = render(<ChatMessages>uno</ChatMessages>)
    const lista = screen.getByRole("log")
    medidas(lista, { scrollHeight: 900, clientHeight: 300 })
    lista.scrollTop = 100
    fireEvent.scroll(lista)
    medidas(lista, { scrollHeight: 1200, clientHeight: 300 })
    rerender(<ChatMessages>uno dos</ChatMessages>)
    expect(lista.scrollTop).toBe(100)
  })

  it("si volvió a bajar hasta cerca del final, lo vuelve a seguir", () => {
    const { rerender } = render(<ChatMessages>uno</ChatMessages>)
    const lista = screen.getByRole("log")
    medidas(lista, { scrollHeight: 900, clientHeight: 300 })
    lista.scrollTop = 100
    fireEvent.scroll(lista)
    lista.scrollTop = 570
    fireEvent.scroll(lista)
    medidas(lista, { scrollHeight: 1200, clientHeight: 300 })
    rerender(<ChatMessages>uno dos</ChatMessages>)
    expect(lista.scrollTop).toBe(1200)
  })
})

describe("ChatInput", () => {
  it("Enter envía el texto sin espacios y vacía el campo", async () => {
    tactil(false)
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    await userEvent.type(campo(), "  ¿Cuánto debo?  {Enter}")
    expect(onSend).toHaveBeenCalledExactlyOnceWith("¿Cuánto debo?")
    expect(campo()).toHaveValue("")
  })

  it("Shift+Enter baja de renglón y no envía", async () => {
    tactil(false)
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    await userEvent.type(campo(), "uno{Shift>}{Enter}{/Shift}dos")
    expect(onSend).not.toHaveBeenCalled()
    expect(campo()).toHaveValue("uno\ndos")
  })

  it("en una pantalla táctil Enter baja de renglón: se envía con el botón", async () => {
    tactil(true)
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    await userEvent.type(campo(), "hola{Enter}")
    expect(onSend).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }))
    expect(onSend).toHaveBeenCalledExactlyOnceWith("hola")
  })

  it("enterKey lo fuerza para un lado o para el otro", async () => {
    tactil(true)
    const onSend = vi.fn()
    const { unmount } = render(<ChatInput enterKey="send" onSend={onSend} />)
    await userEvent.type(campo(), "hola{Enter}")
    expect(onSend).toHaveBeenCalledTimes(1)
    unmount()
    tactil(false)
    render(<ChatInput enterKey="newline" onSend={onSend} />)
    await userEvent.type(campo(), "hola{Enter}")
    expect(onSend).toHaveBeenCalledTimes(1)
  })

  it("mientras se arma una palabra (IME), Enter la confirma y no envía", () => {
    tactil(false)
    const onSend = vi.fn()
    render(<ChatInput defaultValue="こんにちは" onSend={onSend} />)
    fireEvent.keyDown(campo(), { key: "Enter", isComposing: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it("vacío o con solo espacios, no envía y el botón está apagado", async () => {
    tactil(false)
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled()
    await userEvent.type(campo(), "   {Enter}")
    expect(onSend).not.toHaveBeenCalled()
    await userEvent.type(campo(), "a")
    expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled()
  })

  it("con una respuesta en curso, el botón de enviar es el de detener, en el mismo lugar", async () => {
    tactil(false)
    const onSend = vi.fn()
    const onStop = vi.fn()
    render(<ChatInput busy defaultValue="otra pregunta" onSend={onSend} onStop={onStop} />)
    expect(screen.queryByRole("button", { name: "Enviar" })).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Detener respuesta" }))
    expect(onStop).toHaveBeenCalledTimes(1)
    // Se puede seguir escribiendo, pero Enter no manda nada hasta que termine.
    await userEvent.type(campo(), "{Enter}")
    expect(onSend).not.toHaveBeenCalled()
    expect(campo()).toHaveValue("otra pregunta")
  })

  it("sin onStop, el botón de detener queda apagado en vez de no hacer nada", () => {
    render(<ChatInput busy />)
    expect(screen.getByRole("button", { name: "Detener respuesta" })).toBeDisabled()
  })

  it("controlado, vaciarlo es de la app", async () => {
    tactil(false)
    const onSend = vi.fn()
    const onValueChange = vi.fn()
    render(<ChatInput onSend={onSend} onValueChange={onValueChange} value="fijo" />)
    await userEvent.type(campo(), "{Enter}")
    expect(onSend).toHaveBeenCalledExactlyOnceWith("fijo")
    expect(campo()).toHaveValue("fijo")
    await userEvent.type(campo(), "x")
    expect(onValueChange).toHaveBeenLastCalledWith("fijox")
  })

  it("apagado, ni el campo ni el botón", () => {
    render(<ChatInput defaultValue="hola" disabled />)
    expect(campo()).toBeDisabled()
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled()
  })

  it("el campo tiene el cuerpo de un Textarea y el botón es el de IA sólido", () => {
    render(<ChatInput defaultValue="hola" maxLength={2000} />)
    expect(campo()).toHaveClass("glass-control", "rounded-[min(var(--radius-field),--spacing(5))]", "field-sizing-content", "focus:focus-border", "resize-none")
    expect(campo()).toHaveAttribute("maxlength", "2000")
    expect(campo()).toHaveAttribute("rows", "1")
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveClass("bg-ai-solid", "size-10", "rounded-full")
  })

  it("los textos salen del LabelsProvider, y la prop le gana", () => {
    render(
      <LabelsProvider value={{ chat: { input: "Message", send: "Send", placeholder: "Ask anything…" } }}>
        <ChatInput labels={{ send: "Go" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAttribute("placeholder", "Ask anything…")
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument()
  })
})

describe("Chat: lo que rodea a los mensajes", () => {
  it("una sugerencia es un botón en cápsula que crece si la pregunta es larga", async () => {
    const onClick = vi.fn()
    render(
      <ChatEmpty>
        <p>Hola. ¿En qué te ayudo?</p>
        <ChatSuggestions>
          <ChatSuggestion onClick={onClick}>¿Cuánto facturé este mes?</ChatSuggestion>
        </ChatSuggestions>
      </ChatEmpty>
    )
    const sugerencia = screen.getByRole("button", { name: "¿Cuánto facturé este mes?" })
    expect(sugerencia).toHaveAttribute("type", "button")
    expect(sugerencia).toHaveClass("glass-control", "w-full", "text-left", "min-h-10", "rounded-[min(var(--radius-field),--spacing(5))]")
    expect(sugerencia).not.toHaveClass("h-10")
    await userEvent.click(sugerencia)
    expect(onClick).toHaveBeenCalled()
    // El saludo se pega abajo, contra el campo.
    expect(screen.getByText("Hola. ¿En qué te ayudo?").parentElement).toHaveClass("mt-auto")
  })

  it("ChatTyping anuncia la espera; el dibujo es decoración", () => {
    render(<ChatTyping />)
    const estado = screen.getByRole("status", { name: "Escribiendo una respuesta" })
    expect(estado.querySelectorAll("[data-slot=ai-shimmer]")).toHaveLength(2)
    for (const brillo of estado.querySelectorAll("[data-slot=ai-shimmer]")) expect(brillo).toHaveAttribute("aria-hidden", "true")
  })

  it("ChatError se anuncia solo y ofrece reintentar si se puede", async () => {
    const onRetry = vi.fn()
    const { rerender } = render(<ChatError onRetry={onRetry}>No pude responder ahora.</ChatError>)
    expect(screen.getByRole("alert")).toHaveTextContent("No pude responder ahora.")
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    rerender(<ChatError>No pude responder ahora.</ChatError>)
    expect(screen.queryByRole("button")).toBeNull()
  })
})

// El borde de la IA es una señal de estado: solo se enciende con una respuesta en curso.
describe("Chat: el borde de la IA", () => {
  it("en reposo no está encendido", () => {
    render(<Chat data-testid="chat">x</Chat>)
    const chat = screen.getByTestId("chat")
    expect(chat).toHaveClass("ai-glow", "relative", "rounded-[inherit]")
    expect(chat).not.toHaveAttribute("data-ai-active")
  })

  it("busy lo enciende", () => {
    render(<Chat busy data-testid="chat">x</Chat>)
    expect(screen.getByTestId("chat")).toHaveAttribute("data-ai-active")
  })

  it("busy en el Chat les llega a la lista y al campo", () => {
    render(
      <Chat busy>
        <ChatMessages>x</ChatMessages>
        <ChatInput onStop={() => {}} />
      </Chat>
    )
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: "Detener respuesta" })).toBeEnabled()
    expect(screen.queryByRole("button", { name: "Enviar" })).toBeNull()
  })

  it("el busy propio de una pieza le gana al del Chat", () => {
    render(
      <Chat busy>
        <ChatMessages busy={false}>x</ChatMessages>
        <ChatInput busy={false} />
      </Chat>
    )
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "false")
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument()
  })

  it("las piezas siguen andando sueltas, sin un Chat arriba", () => {
    render(<ChatMessages busy>x</ChatMessages>)
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true")
  })
})

describe("Chat: refs de afuera", () => {
  it("un ref en ChatMessages no rompe el seguimiento del último mensaje", () => {
    const ref = { current: null as HTMLDivElement | null }
    const { rerender } = render(<ChatMessages ref={ref}>uno</ChatMessages>)
    const lista = screen.getByRole("log")
    expect(ref.current).toBe(lista)
    Object.defineProperty(lista, "scrollHeight", { configurable: true, value: 900 })
    Object.defineProperty(lista, "clientHeight", { configurable: true, value: 300 })
    rerender(<ChatMessages ref={ref}>uno dos</ChatMessages>)
    expect(lista.scrollTop).toBe(900)
  })

  it("inputRef entrega el textarea, para enfocarlo al abrir el panel", () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<ChatInput inputRef={ref} />)
    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Mensaje" }))
    ref.current!.focus()
    expect(ref.current).toHaveFocus()
  })
})
