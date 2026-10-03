"use client"

import { useEffect, useRef } from "react"
import { ReceiptTextIcon, UsersIcon, WalletIcon } from "lucide-react"
import { AiIcon } from "sebs7n-ui/ai-button"
import { Chat, ChatDisclaimer, ChatEmpty, ChatFooter, ChatInput, ChatMessage, ChatMessages, ChatSuggestion, ChatSuggestions, ChatTyping } from "sebs7n-ui/chat"

import { SUGGESTIONS } from "../_lib/assistant"
import type { Assistant } from "../_state/use-assistant"

// El cuerpo del panel lateral del asistente: se pide recién la primera vez que se abre (`next/dynamic`
// en el layout). La cabecera con el título y la «X» la pone `AppShell`.
export default function AssistantPanel({ assistant }: { assistant: Assistant }) {
  const input = useRef<HTMLTextAreaElement>(null)
  // El panel se pide al abrirlo: al llegar, el foco va al campo para escribir de una.
  useEffect(() => input.current?.focus(), [])
  const { turns, thinking, ask, stop } = assistant
  return (
    <Chat busy={thinking} className="min-h-0 flex-1">
      <ChatMessages>
        {turns.length === 0 && (
          <ChatEmpty>
            <div aria-hidden="true" className="mx-auto mb-2 grid size-28 place-items-center">
              <div className="relative grid size-16 place-items-center rounded-full bg-ai/10">
                <AiIcon className="size-8" />
                <ReceiptTextIcon className="absolute -top-3 -right-8 size-5 text-label-tertiary" />
                <UsersIcon className="absolute -bottom-2 -left-9 size-5 text-label-tertiary" />
                <WalletIcon className="absolute -right-9 -bottom-3 size-4 text-label-tertiary" />
              </div>
            </div>
            <p className="text-center text-body font-semibold text-label">Preguntame por tus facturas</p>
            <p className="text-center">Vencimientos, cobros, deudores y recordatorios, con los datos de la demo.</p>
            <ChatSuggestions>
              {SUGGESTIONS.map((suggestion) => (
                <ChatSuggestion key={suggestion} onClick={() => ask(suggestion)}>
                  {suggestion}
                </ChatSuggestion>
              ))}
            </ChatSuggestions>
          </ChatEmpty>
        )}
        {turns.map((turn) => (
          <ChatMessage from={turn.from} key={turn.id}>
            <span className="whitespace-pre-line">{turn.text}</span>
          </ChatMessage>
        ))}
        {thinking && <ChatTyping />}
      </ChatMessages>
      <ChatFooter>
        <ChatInput inputRef={input} maxLength={500} onSend={ask} onStop={stop} />
        <ChatDisclaimer>Respuestas simuladas, armadas con los datos de la demo.</ChatDisclaimer>
      </ChatFooter>
    </Chat>
  )
}
