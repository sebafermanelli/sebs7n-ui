export interface ChatTurn {
  id: number
  from: "user" | "assistant"
  text: string
}

/** Suma un mensaje con el siguiente id: la conversación es una lista que solo crece. */
export const addTurn = (turns: ChatTurn[], from: ChatTurn["from"], text: string): ChatTurn[] => [...turns, { id: Math.max(0, ...turns.map((t) => t.id)) + 1, from, text }]

/** Un mensaje sin texto (solo espacios) no se manda. */
export const cleanQuestion = (text: string) => text.trim()
