"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { answerFor } from "../_data/assistant"
import { addTurn, cleanQuestion, type ChatTurn } from "./conversation"
import { useProject } from "./project-context"

/** Lo que tarda en «pensar» la respuesta simulada. */
const THINK_MS = 700

// La conversación del asistente vive en el layout (no en el panel): el panel se desmonta al cerrarse
// y la charla tiene que sobrevivir a eso y a la navegación entre secciones. Responde con reglas sobre lo
// que hay en pantalla, sin modelo ni red.
export function useAssistant() {
  const { project, services, deployments } = useProject()
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [thinking, setThinking] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const context = useRef({ project, services, deployments })
  context.current = { project, services, deployments }

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setThinking(false)
  }, [])

  const ask = useCallback(
    (raw: string) => {
      const question = cleanQuestion(raw)
      if (!question || timer.current) return
      setTurns((previous) => addTurn(previous, "user", question))
      setThinking(true)
      timer.current = setTimeout(() => {
        timer.current = null
        setTurns((previous) => addTurn(previous, "assistant", answerFor(question, context.current)))
        setThinking(false)
      }, THINK_MS)
    },
    []
  )

  const reset = useCallback(() => {
    stop()
    setTurns([])
  }, [stop])

  return { turns, thinking, ask, stop, reset, project }
}

export type Assistant = ReturnType<typeof useAssistant>
