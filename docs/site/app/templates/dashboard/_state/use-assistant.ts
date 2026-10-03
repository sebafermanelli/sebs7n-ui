"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { answerFor } from "../_lib/assistant"
import { useInvoicesStore } from "./invoices-context"

export interface ChatTurn {
  id: number
  from: "user" | "assistant"
  text: string
}

/** Lo que tarda en «pensar» la respuesta simulada. */
const THINK_MS = 700

/** Suma un mensaje con el siguiente id: la conversación es una lista que solo crece. */
export const addTurn = (turns: ChatTurn[], from: ChatTurn["from"], text: string): ChatTurn[] => [...turns, { id: Math.max(0, ...turns.map((t) => t.id)) + 1, from, text }]

// La conversación vive en el layout, no en el panel: el panel se desmonta al cerrarse y la charla tiene que
// sobrevivir a eso y a la navegación entre secciones. Las respuestas salen de las facturas del store.
export function useAssistant() {
  const { invoices } = useInvoicesStore()
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [thinking, setThinking] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(invoices)
  latest.current = invoices

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setThinking(false)
  }, [])

  const ask = useCallback((raw: string) => {
    const question = raw.trim()
    if (!question || timer.current) return
    setTurns((previous) => addTurn(previous, "user", question))
    setThinking(true)
    timer.current = setTimeout(() => {
      timer.current = null
      setTurns((previous) => addTurn(previous, "assistant", answerFor(question, latest.current)))
      setThinking(false)
    }, THINK_MS)
  }, [])

  const reset = useCallback(() => {
    stop()
    setTurns([])
  }, [stop])

  return { turns, thinking, ask, stop, reset }
}

export type Assistant = ReturnType<typeof useAssistant>
