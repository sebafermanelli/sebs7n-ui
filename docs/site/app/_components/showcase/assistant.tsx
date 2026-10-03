"use client"

import { FileTextIcon, FolderIcon, MailIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { AiIcon } from "sebs7n-ui/ai-button"
import { Chat, ChatDisclaimer, ChatEmpty, ChatFooter, ChatInput, ChatMessage, ChatMessages, ChatSuggestion, ChatSuggestions, ChatTyping } from "sebs7n-ui/chat"

import type { ShowcaseId } from "./catalog"

/** Lo que se sugiere en cada pantalla: el asistente conoce el contexto de donde está parado. */
export const SUGERENCIAS: Record<ShowcaseId, string[]> = {
  home: ["¿Qué vence esta semana?", "Resumime lo cobrado este mes"],
  files: ["¿Dónde está la factura 0013?", "¿Cuánto espacio queda?"],
  settings: ["¿Qué incluye el plan Pro?", "¿Cuánto espacio me queda?"],
  mail: ["¿Qué mensajes están sin leer?", "Armá una respuesta para Estudio Ruiz"]
}

const RESPUESTAS: { palabras: string[]; texto: string }[] = [
  { palabras: ["vence", "semana"], texto: "Esta semana vence la factura 0014 de Estudio Ruiz ($ 41.200) y hay un pago a proveedores el jueves 2." },
  { palabras: ["cobrad", "mes", "resum"], texto: "En septiembre se cobraron 18 facturas por $ 4.820.300: el 91,6 % de lo emitido. Falta una vencida." },
  { palabras: ["0013", "donde", "archivo"], texto: "La Factura 0013.pdf está en Archivos › Facturas › 2026 › Septiembre. Se subió hoy a las 10:24 (96 KB)." },
  { palabras: ["espacio", "queda"], texto: "Usás 26 GB de 50. Las facturas son lo que más pesa (13,5 GB); te quedan 24 GB." },
  { palabras: ["plan", "incluye", "pro"], texto: "Plan Pro: hasta 15 usuarios, 500 facturas por mes y 50 GB. Hoy usás 12 usuarios y 412 facturas." },
  { palabras: ["leer", "mensaje"], texto: "Hay 3 sin leer: Nube Digital (comprobante de la 0013), Estudio Ruiz (consulta por la 0014) y Acme S.A. (orden de compra)." },
  { palabras: ["respuesta", "ruiz", "arma"], texto: "Borrador: «Hola, te reenviamos la factura 0014 con el nuevo domicilio fiscal. Cualquier consulta, avisanos.»" }
]

/** Una respuesta simulada: reglas por palabra clave, sin modelo ni red. La misma pregunta da siempre lo mismo. */
export function responder(pregunta: string): string {
  const q = pregunta
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
  return (
    RESPUESTAS.find((respuesta) => respuesta.palabras.some((palabra) => q.includes(palabra)))?.texto ??
    "Es una respuesta simulada: probá con una de las sugerencias. En tu app, acá va la llamada a tu modelo."
  )
}

type Turno = { id: number; from: "user" | "assistant"; text: string }

/**
 * El cuerpo del panel lateral: `Chat` con respuestas simuladas. `AppShell` solo lo monta abierto y la
 * cabecera con el título y la «X» la pone él. El módulo se pide recién la primera vez que se abre.
 */
export default function AssistantPanel({ screen }: { screen: ShowcaseId }) {
  const input = useRef<HTMLTextAreaElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [pensando, setPensando] = useState(false)
  useEffect(() => input.current?.focus(), [])
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const preguntar = (texto: string) => {
    const pregunta = texto.trim()
    if (!pregunta || timer.current) return
    setTurnos((antes) => [...antes, { id: antes.length + 1, from: "user", text: pregunta }])
    setPensando(true)
    timer.current = setTimeout(() => {
      timer.current = null
      setTurnos((antes) => [...antes, { id: antes.length + 1, from: "assistant", text: responder(pregunta) }])
      setPensando(false)
    }, 600)
  }
  const parar = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setPensando(false)
  }

  return (
    <Chat busy={pensando} className="min-h-0 flex-1">
      <ChatMessages>
        {turnos.length === 0 && (
          <ChatEmpty>
            <div aria-hidden="true" className="mx-auto mb-2 grid size-24 place-items-center">
              <div className="relative grid size-14 place-items-center rounded-full bg-ai/10">
                <AiIcon className="size-7" />
                <FileTextIcon className="absolute -top-3 -right-7 size-5 text-label-tertiary" />
                <MailIcon className="absolute -bottom-2 -left-8 size-5 text-label-tertiary" />
                <FolderIcon className="absolute -right-8 -bottom-3 size-4 text-label-tertiary" />
              </div>
            </div>
            <p className="text-center text-body font-semibold text-label">Preguntame por tus datos</p>
            <p className="text-center">Respuestas simuladas, con los datos de la muestra.</p>
            <ChatSuggestions>
              {SUGERENCIAS[screen].map((sugerencia) => (
                <ChatSuggestion key={sugerencia} onClick={() => preguntar(sugerencia)}>
                  {sugerencia}
                </ChatSuggestion>
              ))}
            </ChatSuggestions>
          </ChatEmpty>
        )}
        {turnos.map((turno) => (
          <ChatMessage from={turno.from} key={turno.id}>
            <span className="whitespace-pre-line">{turno.text}</span>
          </ChatMessage>
        ))}
        {pensando && <ChatTyping />}
      </ChatMessages>
      <ChatFooter>
        <ChatInput inputRef={input} maxLength={500} onSend={preguntar} onStop={parar} />
        <ChatDisclaimer>Respuestas simuladas: no hay ningún modelo detrás.</ChatDisclaimer>
      </ChatFooter>
    </Chat>
  )
}
