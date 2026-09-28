"use client"

import * as React from "react"
import { ArrowUpIcon, RotateCwIcon, SquareIcon } from "lucide-react"

import { useModality } from "../internal/modality.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { inputControlClassName, inputDisabledClassName, inputMultilineRadiusClassName } from "../variants/input.js"
import { AiButton, AiShimmer } from "./ai-button.js"
import { Button } from "./button.js"

type ChatLabels = Labels["chat"]

/**
 * Una conversación: cabecera, mensajes, y el campo para escribir.
 *
 * Son las piezas de un chat, no un chat armado: no sabe de modelos, ni de streaming, ni de
 * historial. Eso es de la app. Lo que resuelve es lo que se ve y cómo se comporta —quién
 * habla de qué lado, que la lista siga al último mensaje, que Enter envíe—, que es lo que
 * termina distinto en cada pantalla cuando se arma a mano.
 *
 * No dibuja superficie. Va adentro de un `Popover`, de un `Sheet` o de una `Card`: el vidrio
 * lo pone quien lo contiene.
 *
 * ```tsx
 * <Chat busy={respondiendo}>
 *   <ChatHeader>
 *     <ChatTitle>Asistente</ChatTitle>
 *   </ChatHeader>
 *   <ChatMessages>
 *     <ChatMessage from="user">¿Cuánto facturé este mes?</ChatMessage>
 *     <ChatMessage from="assistant">$ 1.284.000, en 14 comprobantes.</ChatMessage>
 *     {respondiendo && <ChatTyping />}
 *   </ChatMessages>
 *   <ChatFooter>
 *     <ChatInput onSend={enviar} onStop={cortar} />
 *     <ChatDisclaimer>La IA puede equivocarse. Revisá los datos importantes.</ChatDisclaimer>
 *   </ChatFooter>
 * </Chat>
 * ```
 */
type ChatProps = React.ComponentProps<"div"> & {
  /**
   * Hay una respuesta en curso. Enciende el borde de la IA alrededor de la conversación, y le
   * avisa a `ChatMessages` y a `ChatInput`, que ya no necesitan su propio `busy`.
   */
  busy?: boolean
}

const ChatContext = React.createContext<{ busy: boolean } | null>(null)

function Chat({ className, busy = false, ...props }: ChatProps) {
  const value = React.useMemo(() => ({ busy }), [busy])
  return (
    <ChatContext.Provider value={value}>
      <div
        data-ai-active={busy ? "" : undefined}
        data-slot="chat"
        // `rounded-[inherit]`: el borde de la IA sigue la curva de quien contiene al chat, que
        // es quien tiene el radio. `relative` es lo que ancla ese borde.
        className={cn("relative flex min-h-0 flex-col rounded-[inherit] text-body text-gray-1000 ai-glow", className)}
        {...props}
      />
    </ChatContext.Provider>
  )
}

/** El `busy` que vale: el propio si se pasó, y si no el del `Chat` de arriba. */
function useBusy(propio: boolean | undefined) {
  const contexto = React.useContext(ChatContext)
  return propio ?? contexto?.busy ?? false
}

function ChatHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-header"
      className={cn("flex shrink-0 items-center gap-2 border-b border-gray-alpha-400 py-2 pr-2 pl-4", className)}
      {...props}
    />
  )
}

/** El nombre de la conversación. Ocupa lo que dejan las acciones y corta con puntos suspensivos. */
function ChatTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-title"
      className={cn("flex min-w-0 flex-1 items-center gap-2 truncate text-title-3 [&_svg]:shrink-0", className)}
      {...props}
    />
  )
}

/** Los botones de la cabecera: nueva conversación, historial, cerrar. */
function ChatActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-actions" className={cn("flex shrink-0 items-center gap-1", className)} {...props} />
}

type ChatMessagesProps = React.ComponentProps<"div"> & {
  /** Hay una respuesta en curso: lo anuncia con `aria-busy`. Si no se pasa, toma el del `Chat`. */
  busy?: boolean
  labels?: Partial<ChatLabels>
}

// A cuántos px del final se considera que el usuario «está abajo» y quiere seguir el hilo.
const UMBRAL = 48

/**
 * La lista de mensajes. Scrollea, y sigue al último mensaje mientras el usuario esté abajo.
 *
 * Si subió a leer algo anterior, no lo arrastra: una respuesta que llega de a palabras y
 * devuelve la vista al final en cada una hace imposible leer lo de arriba.
 *
 * Es un `role="log"`: un lector de pantalla anuncia lo que se agrega, sin que el foco se mueva.
 */
function ChatMessages({ className, busy: busyProp, labels: labelsProp, onScroll, ref, children, ...props }: ChatMessagesProps) {
  const busy = useBusy(busyProp)
  const labels = { ...useLabels().chat, ...labelsProp }
  const lista = React.useRef<HTMLDivElement>(null)
  const abajo = React.useRef(true)
  // El `ref` del llamador y el de adentro apuntan al mismo nodo. Sin esto, pasarle un `ref` al
  // componente pisaba el interno y la lista dejaba de seguir al último mensaje, sin avisar.
  const asignar = React.useCallback(
    (nodo: HTMLDivElement | null) => {
      lista.current = nodo
      if (typeof ref === "function") ref(nodo)
      else if (ref) ref.current = nodo
    },
    [ref]
  )

  // Sin dependencias a propósito: corre después de cada render, que es cuando pudo haber
  // cambiado el alto —un mensaje nuevo, o el mismo que creció—. Medir es barato; decidir qué
  // cambió mirando `children` no, y se equivoca con el streaming.
  React.useLayoutEffect(() => {
    const el = lista.current
    if (el && abajo.current) el.scrollTop = el.scrollHeight
  })

  return (
    <div
      aria-busy={busy}
      aria-label={labels.log}
      aria-live="polite"
      data-slot="chat-messages"
      ref={asignar}
      role="log"
      // Tabulable: una lista que scrollea y no tiene nada enfocable adentro no se puede
      // recorrer con el teclado.
      tabIndex={0}
      className={cn(
        "flex min-h-0 flex-auto flex-col gap-3 overflow-y-auto overscroll-contain scroll-fade px-4 py-3 outline-none focus-visible:focus-ring",
        className
      )}
      onScroll={(evento) => {
        const el = evento.currentTarget
        abajo.current = el.scrollHeight - el.scrollTop - el.clientHeight <= UMBRAL
        onScroll?.(evento)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

type ChatMessageProps = React.ComponentProps<"div"> & {
  /** Quién habla. El usuario va a la derecha, en un globo; el asistente a la izquierda, sin globo. */
  from: "user" | "assistant"
}

/**
 * Un mensaje.
 *
 * El del usuario va en un globo con el tinte de marca, a la derecha. El del asistente no
 * lleva globo: es el contenido de la conversación, y suele traer listas y párrafos largos que
 * adentro de un globo se leen apretados.
 *
 * El texto va como `children`: si la respuesta trae formato, la app la convierte a elementos
 * de React. **Nunca como HTML**: lo que escribe un modelo es texto de un tercero.
 */
function ChatMessage({ className, from, ...props }: ChatMessageProps) {
  return (
    <div
      data-from={from}
      data-slot="chat-message"
      className={cn(
        "flex max-w-full flex-col gap-1 wrap-anywhere",
        // La esquina de abajo a la derecha más cerrada: es la cola del globo, de dónde sale.
        "data-[from=user]:ml-8 data-[from=user]:self-end data-[from=user]:rounded-surface data-[from=user]:rounded-br-control data-[from=user]:bg-highlight data-[from=user]:px-3.5 data-[from=user]:py-2 data-[from=user]:whitespace-pre-wrap data-[from=user]:shadow-chip",
        "data-[from=assistant]:mr-8 data-[from=assistant]:items-start data-[from=assistant]:self-start",
        className
      )}
      {...props}
    />
  )
}

/** Lo que se puede hacer con una respuesta: copiar, calificar. Va adentro del `ChatMessage`. */
function ChatMessageActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-message-actions" className={cn("flex items-center gap-0.5 text-gray-900", className)} {...props} />
}

/** El saludo de una conversación vacía. Se pega abajo, contra el campo, que es donde se mira. */
function ChatEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-empty" className={cn("mt-auto flex flex-col gap-2 text-gray-900", className)} {...props} />
}

/** Preguntas sugeridas, una debajo de la otra. */
function ChatSuggestions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-suggestions" className={cn("flex flex-col gap-2", className)} {...props} />
}

/**
 * Una pregunta sugerida. Es un botón: al apretarlo, la app la manda como si se hubiera escrito.
 *
 * Crece en alto si la pregunta no entra en una línea: por eso el radio se frena en 20px, como
 * el de un `Textarea`.
 */
function ChatSuggestion({ className, type = "button", ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="chat-suggestion"
      type={type}
      className={cn(
        inputControlClassName,
        inputMultilineRadiusClassName,
        "min-h-10 w-full cursor-pointer px-4 py-2 text-left transition-surface pointer-coarse:min-h-11",
        "hover:bg-gray-alpha-200 active:scale-[0.99] focus-visible:focus-ring",
        "disabled:cursor-not-allowed disabled:text-gray-700 disabled:shadow-none",
        className
      )}
      {...props}
    />
  )
}

type ChatTypingProps = React.ComponentProps<"div"> & { labels?: Partial<ChatLabels> }

/**
 * «El asistente está escribiendo». Dos renglones con el brillo de la IA.
 *
 * El dibujo es decoración; lo que se anuncia es el `role="status"` con su nombre.
 */
function ChatTyping({ className, labels: labelsProp, ...props }: ChatTypingProps) {
  const labels = { ...useLabels().chat, ...labelsProp }
  return (
    <div aria-label={labels.typing} data-slot="chat-typing" role="status" className={cn("flex w-full flex-col gap-2", className)} {...props}>
      <AiShimmer className="w-3/4" />
      <AiShimmer className="w-1/2" />
    </div>
  )
}

type ChatErrorProps = React.ComponentProps<"div"> & {
  /** Con esto aparece el botón de reintentar. */
  onRetry?: () => void
  labels?: Partial<ChatLabels>
}

/** La respuesta que no llegó. Se anuncia sola (`role="alert"`) y ofrece volver a intentar. */
function ChatError({ className, onRetry, labels: labelsProp, children, ...props }: ChatErrorProps) {
  const labels = { ...useLabels().chat, ...labelsProp }
  return (
    <div data-slot="chat-error" className={cn("flex flex-wrap items-center gap-2 text-red-900", className)} {...props}>
      <p role="alert">{children}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" type="button" variant="outline">
          <RotateCwIcon aria-hidden="true" />
          {labels.retry}
        </Button>
      )}
    </div>
  )
}

function ChatFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-footer"
      className={cn("flex shrink-0 flex-col gap-2 border-t border-gray-alpha-400 px-4 pt-3 pb-3", className)}
      {...props}
    />
  )
}

type ChatInputProps = Omit<React.ComponentProps<"form">, "onSubmit" | "children"> & {
  /** El texto, controlado. */
  value?: string
  /** El texto con el que arranca, sin controlar. */
  defaultValue?: string
  /** Avisa cada cambio del texto. */
  onValueChange?: (value: string) => void
  /** Manda el mensaje, ya sin espacios a los costados. Sin controlar, el campo se vacía solo. */
  onSend?: (message: string) => void
  /** Hay una respuesta en curso: el botón de enviar pasa a ser el de detener. Si no se pasa, toma el del `Chat`. */
  busy?: boolean
  /** Corta la respuesta en curso. Sin esto, mientras `busy` el botón queda apagado. */
  onStop?: () => void
  /** Apaga el campo y el botón: sin conexión, límite de mensajes alcanzado. */
  disabled?: boolean
  /** El largo máximo del mensaje. */
  maxLength?: number
  /**
   * Qué hace Enter. `auto` (el default) envía con mouse o trackpad y hace un salto de línea en
   * una pantalla táctil, donde el teclado en pantalla no tiene otra forma de bajar de renglón.
   */
  enterKey?: "auto" | "send" | "newline"
  /** El `<textarea>`, para enfocarlo desde afuera: al abrir el panel, después de una respuesta. */
  inputRef?: React.Ref<HTMLTextAreaElement>
  labels?: Partial<ChatLabels>
}

const esTactil = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches

/**
 * El campo para escribir y el botón de enviar.
 *
 * Crece con el texto hasta unas seis líneas y después scrollea. Enter envía y Shift+Enter
 * baja de renglón; en una pantalla táctil Enter baja de renglón y se envía con el botón.
 *
 * Mientras hay una respuesta en curso (`busy`) el botón de enviar es el de detener, en el
 * mismo lugar: quien quiere cortar no tiene que buscar otro control.
 */
function ChatInput({
  className,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSend,
  busy: busyProp,
  onStop,
  disabled = false,
  maxLength,
  enterKey = "auto",
  inputRef,
  labels: labelsProp,
  ...props
}: ChatInputProps) {
  useModality()
  const busy = useBusy(busyProp)
  const labels = { ...useLabels().chat, ...labelsProp }
  const id = React.useId()
  const [interno, setInterno] = React.useState(defaultValue)
  const texto = valueProp ?? interno
  const vacio = texto.trim() === ""

  const cambiar = (siguiente: string) => {
    if (valueProp === undefined) setInterno(siguiente)
    onValueChange?.(siguiente)
  }
  const enviar = () => {
    if (vacio || busy || disabled) return
    onSend?.(texto.trim())
    // Controlado, vaciarlo es de la app: es quien sabe si el envío salió.
    if (valueProp === undefined) setInterno("")
  }

  return (
    <form
      data-slot="chat-input"
      className={cn("flex items-end gap-2", className)}
      onSubmit={(evento) => {
        evento.preventDefault()
        enviar()
      }}
      {...props}
    >
      <label className="sr-only" htmlFor={id}>
        {labels.input}
      </label>
      <textarea
        data-slot="chat-input-field"
        disabled={disabled}
        enterKeyHint={enterKey === "newline" ? "enter" : "send"}
        id={id}
        maxLength={maxLength}
        placeholder={labels.placeholder}
        ref={inputRef}
        rows={1}
        value={texto}
        className={cn(
          inputControlClassName,
          inputDisabledClassName,
          inputMultilineRadiusClassName,
          // 32px como el botón de al lado. En táctil, 44px y 16px de letra: con menos, iOS hace
          // zoom al enfocar. Sin `field-sizing` (un Safari viejo) queda en una línea con scroll.
          "field-sizing-content max-h-36 min-h-8 min-w-0 flex-1 resize-none overflow-y-auto px-3 py-1.75 placeholder:text-gray-900 focus:focus-border",
          "pointer-coarse:min-h-11 pointer-coarse:py-2.5 pointer-coarse:text-title-3 pointer-coarse:font-normal",
          "disabled:cursor-not-allowed disabled:border-gray-alpha-400 disabled:bg-gray-alpha-100 disabled:text-gray-700 disabled:shadow-none"
        )}
        onChange={(evento) => cambiar(evento.target.value)}
        onKeyDown={(evento) => {
          // `isComposing`: en japonés o coreano Enter confirma la palabra que se está armando.
          if (evento.key !== "Enter" || evento.shiftKey || evento.nativeEvent.isComposing) return
          if (enterKey === "newline" || (enterKey === "auto" && esTactil())) return
          evento.preventDefault()
          enviar()
        }}
      />
      {busy ? (
        <AiButton
          aria-label={labels.stop}
          className="pointer-coarse:size-11"
          data-slot="chat-stop"
          disabled={!onStop}
          onClick={onStop}
          size="icon-md"
          type="button"
          variant="solid"
        >
          <SquareIcon aria-hidden="true" className="fill-current" />
        </AiButton>
      ) : (
        <AiButton
          aria-label={labels.send}
          className="pointer-coarse:size-11"
          data-slot="chat-send"
          disabled={disabled || vacio}
          size="icon-md"
          type="submit"
          variant="solid"
        >
          <ArrowUpIcon aria-hidden="true" />
        </AiButton>
      )}
    </form>
  )
}

/** La letra chica: que lo que dice el asistente se confirme. Va debajo del campo. */
function ChatDisclaimer({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="chat-disclaimer" className={cn("text-center text-callout text-gray-900", className)} {...props} />
}

export {
  Chat,
  ChatActions,
  ChatDisclaimer,
  ChatEmpty,
  ChatError,
  ChatFooter,
  ChatHeader,
  ChatInput,
  ChatMessage,
  ChatMessageActions,
  ChatMessages,
  ChatSuggestion,
  ChatSuggestions,
  ChatTitle,
  ChatTyping,
  type ChatErrorProps,
  type ChatProps,
  type ChatInputProps,
  type ChatLabels,
  type ChatMessageProps,
  type ChatMessagesProps,
  type ChatTypingProps,
}
