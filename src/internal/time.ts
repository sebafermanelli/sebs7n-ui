// Horas «HH:MM» de 24 h para TimePicker y DateTimePicker. Vive en `internal/` y no en `lib/`
// porque `lib/*` es API pública y entra entera al barrel.

/** Minutos desde la medianoche de una hora «HH:MM». */
export const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))

/** «HH:MM» de unos minutos desde la medianoche. */
export const fromMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`

/**
 * Lo que se tipea, a «HH:MM»; `null` si no es una hora. Acepta «9», «930», «0930», «9:30»,
 * «09:30» y «9.30»: la hora con uno o dos dígitos y los minutos siempre con dos. «9:5» no: en la
 * lista es el comienzo de «09:50», y al salir del campo no puede querer decir otra cosa.
 */
export function parseTime(text: string): string | null {
  const clean = text.trim()
  let hours: number
  let minutes: number
  const withSeparator = /^(\d{1,2})[:.h](\d{2})$/.exec(clean)
  if (withSeparator) {
    hours = Number(withSeparator[1])
    minutes = Number(withSeparator[2])
  } else if (/^\d{1,4}$/.test(clean)) {
    const hasMinutes = clean.length > 2
    hours = Number(hasMinutes ? clean.slice(0, -2) : clean)
    minutes = hasMinutes ? Number(clean.slice(-2)) : 0
  } else {
    return null
  }
  if (hours > 23 || minutes > 59) return null
  return fromMinutes(hours * 60 + minutes)
}

/** Las horas de la lista: de `min` a `max` cada `step` minutos, contando desde `min` (como `<input type="time">`). */
export function timeSlots(step: number, min = "00:00", max = "23:59"): string[] {
  const slots: string[] = []
  const increment = Math.max(1, Math.floor(step))
  for (let minutes = toMinutes(min); minutes <= toMinutes(max); minutes += increment) slots.push(fromMinutes(minutes))
  return slots
}

/** Lleva una hora al rango. */
export function clampTime(time: string, min?: string, max?: string): string {
  if (min && toMinutes(time) < toMinutes(min)) return min
  if (max && toMinutes(time) > toMinutes(max)) return max
  return time
}

/**
 * ¿Lo tipeado es el comienzo de esta hora? «9», «09», «93» y «9:3» encuentran «09:30»; «14» es
 * las 14 y no «01:4x»: el 0 de adelante se agrega solo cuando la hora no puede tener dos dígitos
 * (un solo dígito, o uno de 3 a 9) o cuando hay separador.
 */
export function matchesTime(slot: string, query: string): boolean {
  const text = query.trim()
  const withSeparator = /^(\d{1,2})[:.h](\d{0,2})$/.exec(text)
  const digits = withSeparator ? withSeparator[1]!.padStart(2, "0") + withSeparator[2] : text.replace(/\D/g, "")
  if (!digits) return true
  const slotDigits = slot.replace(":", "")
  if (slotDigits.startsWith(digits)) return true
  return !withSeparator && (digits.length === 1 || digits[0]! > "2") && slotDigits.startsWith(`0${digits}`)
}
