"use client"

import { HistoryIcon, PlusIcon, ThumbsDownIcon, ThumbsUpIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { AiIcon, AiLauncher } from "sebs7n-ui/ai-button"
import { Button } from "sebs7n-ui/button"
import { Card } from "sebs7n-ui/card"
import {
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
} from "sebs7n-ui/chat"
import { Popover, PopoverContent, PopoverTrigger } from "sebs7n-ui/popover"

type Mensaje = { id: number; from: "user" | "assistant"; texto: string }

const SUGERENCIAS = ["¿Cuánto facturé este mes?", "¿Qué facturas están vencidas?", "Resumime la semana"]
const RESPUESTAS: Record<string, string> = {
  "¿Cuánto facturé este mes?": "Facturaste $ 1.284.000 en 14 comprobantes. Es un 12 % más que el mes pasado.",
  "¿Qué facturas están vencidas?": "Hay 3 vencidas por $ 142.900. La más vieja es la 0009, de hace 18 días.",
  "Resumime la semana": "Emitiste 6 facturas, cobraste 4 y quedó una pendiente de aprobación.",
}

/** Una conversación de mentira: responde después de un rato, y se puede cortar. */
function useConversacion() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [respondiendo, setRespondiendo] = useState(false)
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null)
  const proximo = useRef(1)

  const enviar = (texto: string) => {
    setMensajes((lista) => [...lista, { id: proximo.current++, from: "user", texto }])
    setRespondiendo(true)
    espera.current = setTimeout(() => {
      const respuesta = RESPUESTAS[texto] ?? "Eso no lo tengo a mano todavía."
      setMensajes((lista) => [...lista, { id: proximo.current++, from: "assistant", texto: respuesta }])
      setRespondiendo(false)
    }, 1400)
  }
  const cortar = () => {
    if (espera.current) clearTimeout(espera.current)
    setRespondiendo(false)
  }
  const nueva = () => {
    cortar()
    setMensajes([])
  }
  return { mensajes, respondiendo, enviar, cortar, nueva }
}

function Conversacion({ onClose, onBusyChange }: { onClose?: () => void; onBusyChange?: (busy: boolean) => void }) {
  const { mensajes, respondiendo, enviar, cortar, nueva } = useConversacion()
  // El lanzador vive afuera del panel: para que su canto gire mientras hay una respuesta en
  // camino, alguien le tiene que avisar.
  useEffect(() => onBusyChange?.(respondiendo), [respondiendo, onBusyChange])
  return (
    // `busy` en el `Chat` enciende el borde de la IA y les avisa a la lista y al campo.
    <Chat busy={respondiendo} className="h-full">
      <ChatHeader>
        <ChatTitle>
          <AiIcon className="size-5" />
          Asistente
        </ChatTitle>
        <ChatActions>
          <Button aria-label="Nueva conversación" onClick={nueva} size="icon-sm" variant="ghost">
            <PlusIcon />
          </Button>
          <Button aria-label="Conversaciones" size="icon-sm" variant="ghost">
            <HistoryIcon />
          </Button>
          {onClose && (
            <Button aria-label="Cerrar asistente" onClick={onClose} size="icon-sm" variant="ghost">
              <XIcon />
            </Button>
          )}
        </ChatActions>
      </ChatHeader>
      <ChatMessages>
        {mensajes.length === 0 && (
          <ChatEmpty>
            <p>Hola. ¿En qué te ayudo?</p>
            <ChatSuggestions>
              {SUGERENCIAS.map((sugerencia) => (
                <ChatSuggestion key={sugerencia} onClick={() => enviar(sugerencia)}>
                  {sugerencia}
                </ChatSuggestion>
              ))}
            </ChatSuggestions>
          </ChatEmpty>
        )}
        {mensajes.map((mensaje) => (
          <ChatMessage from={mensaje.from} key={mensaje.id}>
            {mensaje.texto}
            {mensaje.from === "assistant" && (
              <ChatMessageActions>
                <Button aria-label="Buena respuesta" size="icon-sm" variant="ghost">
                  <ThumbsUpIcon />
                </Button>
                <Button aria-label="Mala respuesta" size="icon-sm" variant="ghost">
                  <ThumbsDownIcon />
                </Button>
              </ChatMessageActions>
            )}
          </ChatMessage>
        ))}
        {respondiendo && <ChatTyping />}
      </ChatMessages>
      <ChatFooter>
        <ChatInput maxLength={2000} onSend={enviar} onStop={cortar} />
        <ChatDisclaimer>La IA puede equivocarse. Revisá los datos importantes.</ChatDisclaimer>
      </ChatFooter>
    </Chat>
  )
}

/**
 * El asistente entero
 * El lanzador abre un panel de vidrio con la conversación. Apretá una sugerencia: mientras responde, el borde del panel se enciende y el canto del lanzador gira.
 */
export function Asistente() {
  const [abierto, setAbierto] = useState(false)
  const [respondiendo, setRespondiendo] = useState(false)
  return (
    <div className="flex h-24 w-full items-center justify-end pr-4">
      <Popover onOpenChange={setAbierto} open={abierto}>
        <PopoverTrigger render={<AiLauncher active={respondiendo} label={abierto ? "Cerrar asistente" : "Asistente"} />}>
          {abierto ? <XIcon /> : undefined}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          aria-label="Asistente"
          // Material grueso: es de lo más grande que flota. `p-0` y `gap-0` porque el aire lo
          // ponen las piezas del chat, que llegan hasta el borde con sus líneas divisorias.
          className="h-[min(560px,var(--available-height))] w-[min(400px,var(--available-width))] gap-0 overflow-hidden rounded-panel glass-thick p-0"
          side="top"
          sideOffset={12}
        >
          <Conversacion onBusyChange={setRespondiendo} onClose={() => setAbierto(false)} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * En una tarjeta
 * Las mismas piezas, fijas en la página. El `Chat` no dibuja superficie: acá la pone la `Card`.
 */
export function EnTarjeta() {
  return (
    <Card className="h-[480px] w-full max-w-md gap-0 overflow-hidden py-0">
      <Conversacion />
    </Card>
  )
}

/**
 * Estados
 * Una respuesta en curso: el borde encendido, «escribiendo» y el botón de detener. Y el error con su reintento.
 */
export function Estados() {
  return (
    <Card className="w-full max-w-md gap-0 overflow-hidden py-0">
      <Chat busy>
        <ChatMessages className="max-h-80">
          <ChatMessage from="user">¿Cuál fue el cliente que más compró?</ChatMessage>
          <ChatTyping />
          <ChatMessage from="user">¿Y el mes pasado?</ChatMessage>
          <ChatError onRetry={() => {}}>No pude responder ahora. Probá de nuevo en un rato.</ChatError>
        </ChatMessages>
        <ChatFooter>
          <ChatInput onStop={() => {}} />
        </ChatFooter>
      </Chat>
    </Card>
  )
}
