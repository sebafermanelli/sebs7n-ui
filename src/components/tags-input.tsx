"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { CircleAlertIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useFieldControl } from "../internal/field-control.js"
import { useFormReset } from "../internal/form-reset.js"
import { mergeRefs } from "../internal/merge-refs.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { inputMultilineRadiusClassName, inputShellClassName } from "../variants/input.js"
import { Tag } from "./tag.js"

type TagsInputLabels = NonNullable<Labels["tagsInput"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const tagsInputLabels: TagsInputLabels = {
  remove: "Quitar",
  added: "Agregada:",
  removed: "Quitada:",
  duplicate: "ya está",
  tooMany: "no entra: el máximo es",
}

type TagsInputProps = {
  /** Las etiquetas, controlado. */
  value?: string[]
  /** Las etiquetas al montar, sin controlar. */
  defaultValue?: string[]
  /** Avisa la lista entera cada vez que se agrega o se quita una. */
  onValueChange?: (value: string[]) => void
  /**
   * Lo escrito sin Enter se agrega al salir del campo y antes de que el `<form>` que lo contiene
   * se envíe o se lea (`submit` y `new FormData(form)`), validado como con Enter: si no entra, el
   * texto queda con su error y el form no se envía. Default `false` para no cambiar el
   * comportamiento en una versión patch; en un formulario con «Guardar», **conviene `true`**:
   * sin eso, lo tipeado sin Enter se pierde al enviar.
   */
  addOnBlur?: boolean
  /**
   * Qué separa etiquetas: `"Enter"` es la tecla; el resto, caracteres que al tipearse agregan lo de
   * antes. Pegar separa por los mismos (y por renglones si está `"Enter"`). Default: Enter y coma
   * (y al tipear o pegar, también punto y coma, tabs y renglones). `["Enter"]` deja pasar comas
   * decimales («38,5»).
   */
  delimiters?: string[]
  /** Cuántas como mucho. La que no entra se avisa en línea. */
  max?: number
  /**
   * Una validación por etiqueta, antes de agregarla: el texto que devuelve es el error en línea
   * («ana no es un correo») y la etiqueta no entra (el texto queda en el campo para corregirlo).
   */
  validate?: (tag: string, tags: readonly string[]) => string | undefined
  /** El nombre con el que viajan en un formulario: una etiqueta por campo, como un grupo de checkboxes. */
  name?: string
  /** Sin etiquetas no se puede enviar: dentro de un `Form`, el campo queda inválido y `Form` lo enfoca. */
  required?: boolean
  /** 28, 36 (default) o 40 de alto mínimo, como los campos; crece con las filas de etiquetas. */
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  placeholder?: string
  /** El `id` del campo de texto, para un `<Label htmlFor>`. */
  id?: string
  /** Nombra el campo y la lista de etiquetas. */
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  /** Clases de la superficie. */
  className?: string
  ref?: React.Ref<HTMLInputElement>
  /** Textos: `remove`, `added`, `removed`, `duplicate` y `tooMany`. Por defecto, `tagsInputLabels`. */
  labels?: Partial<TagsInputLabels>
}

/** Sin `delimiters`: pegar «a, b\nc» son tres (comas, punto y coma, tabs y renglones). */
const SEPARATORS = /[,;\t\n\r]+/

/** Los caracteres de `delimiters` como una expresión; renglones si está Enter. `null` si nada separa. */
function separatorsFor(delimiters: readonly string[] | undefined): RegExp | null {
  if (!delimiters) return SEPARATORS
  const chars = delimiters.filter((delimiter) => delimiter !== "Enter")
  if (delimiters.includes("Enter")) chars.push("\n", "\r")
  if (!chars.length) return null
  const escaped = chars.map((char) => char.replace(/[.*+?^${}()|[\]\\\-]/g, "\\$&"))
  return new RegExp(`(?:${escaped.join("|")})+`)
}

/**
 * Un campo de etiquetas libres: se escribe y Enter (o coma) la agrega como un `Tag`; Backspace con el
 * campo vacío quita la última; pegar una lista la separa. Valida cada una antes de agregarla
 * (repetidas, `max`, `validate`) con el error en línea, y con `name` viajan con el `<form>`. Una
 * repetida lo es sin importar mayúsculas: «Urgente» no entra si ya está «urgente». Pegar inserta en el
 * cursor, como en cualquier campo, y después separa.
 *
 * Es texto libre: para elegir de una lista, `Combobox multiple`. Dentro de un `Field` se registra como
 * su control (etiqueta, ayuda, error, el `name` del `Field` y el foco desde `Form`).
 */
function TagsInput({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  addOnBlur = false,
  delimiters,
  max,
  validate,
  name,
  required = false,
  size = "md",
  disabled: disabledProp,
  placeholder,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  className,
  ref,
  labels: labelsProp,
}: TagsInputProps) {
  const labels = { ...tagsInputLabels, ...useLabels().tagsInput, ...defined(labelsProp) }
  const [own, setOwn] = React.useState(defaultValue)
  const tags = valueProp ?? own
  const [draft, setDraft] = React.useState("")
  const [errors, setErrors] = React.useState<string[]>([])
  const [status, setStatus] = React.useState("")
  const input = React.useRef<HTMLInputElement>(null)
  const inputRef = React.useMemo(() => mergeRefs(input, ref), [ref])
  const field = useFieldControl({ id, name, value: tags, filled: tags.length > 0, disabled: disabledProp, controlRef: input })
  const disabled = field.disabled
  const errorsId = React.useId()
  const resetRef = useFormReset(() => {
    if (valueProp === undefined) setOwn(defaultValue)
    setDraft("")
    setErrors([])
  })

  // Un aviso igual al anterior no cambia el texto y el lector no lo repite: se limpia y se escribe
  // en la vuelta siguiente.
  const announce = (message: string) => {
    if (message !== status) return setStatus(message)
    setStatus("")
    setTimeout(() => setStatus(message), 50)
  }

  const commit = (next: string[]) => {
    if (valueProp === undefined) setOwn(next)
    onValueChange?.(next)
  }

  const separators = React.useMemo(() => separatorsFor(delimiters), [delimiters?.join("\u0000")])
  const enterAdds = !delimiters || delimiters.includes("Enter")

  /**
   * Agrega lo que se pueda de `texts`; lo que no entra queda con su error y, si era lo tipeado, en
   * el campo. Devuelve las agregadas y si hubo alguna que no entró.
   */
  const add = (texts: string[]) => {
    const next = [...tags]
    const problems: string[] = []
    const rejected: string[] = []
    for (const raw of texts) {
      const tag = raw.trim()
      if (!tag) continue
      const message = next.some((other) => other.toLowerCase() === tag.toLowerCase())
        ? labels.duplicate
        : max !== undefined && next.length >= max
          ? `${labels.tooMany} ${max}`
          : validate?.(tag, next)
      if (message) {
        problems.push(`${tag} ${message}`)
        rejected.push(tag)
      } else next.push(tag)
    }
    setErrors(problems)
    setDraft(rejected.join(", "))
    const added = next.slice(tags.length)
    if (added.length) {
      commit(next)
      announce(`${labels.added} ${added.join(", ")}`)
    }
    return { added, rejected: rejected.length > 0 }
  }

  // Los listeners del `<form>` ven siempre el texto y la función de este render.
  const latest = React.useRef({ draft, add })
  React.useLayoutEffect(() => {
    latest.current = { draft, add }
  })

  // Con `addOnBlur`, lo escrito entra antes de que el form se envíe o se lea. El listener va en el
  // `<form>` mismo, que corre antes que el `onSubmit` de React (delegado en la raíz): con
  // `flushSync`, los hidden y el valor registrado en `Form` ya tienen la etiqueta nueva.
  React.useEffect(() => {
    const form = input.current?.form
    if (!addOnBlur || !form) return
    const onSubmit = (event: SubmitEvent) => {
      if (!latest.current.draft.trim()) return
      let rejected = false
      flushSync(() => {
        rejected = latest.current.add([latest.current.draft]).rejected
      })
      if (rejected) {
        // No entra: no se envía sin ella, queda el error y el foco en el campo para corregirla.
        event.preventDefault()
        event.stopImmediatePropagation()
        input.current?.focus()
      }
    }
    // `new FormData(form)` sin submit: el state no llega a los hidden a tiempo, se suma a mano.
    const onFormData = (event: FormDataEvent) => {
      const { draft: text, add: addNow } = latest.current
      if (!text.trim()) return
      const { added } = addNow([text])
      if (field.name) for (const tag of added) event.formData.append(field.name, tag)
    }
    form.addEventListener("submit", onSubmit)
    form.addEventListener("formdata", onFormData)
    return () => {
      form.removeEventListener("submit", onSubmit)
      form.removeEventListener("formdata", onFormData)
    }
  }, [addOnBlur, field.name])

  const remove = (index: number) => {
    const tag = tags[index]!
    commit(tags.filter((_, other) => other !== index))
    announce(`${labels.removed} ${tag}`)
    setErrors([])
  }

  const describedBy = cn(ariaDescribedby, field.messageIds.join(" "), errors.length > 0 && errorsId) || undefined
  const listLabel = ariaLabel ? { "aria-label": ariaLabel } : { "aria-labelledby": ariaLabelledby ?? field.labelId }

  return (
    <div ref={resetRef} data-slot="tags-input" className="flex w-full min-w-0 flex-col gap-2">
      <div
        data-slot="tags-input-group"
        data-size={size}
        data-disabled={disabled ? "" : undefined}
        // Un clic en el aire de la superficie enfoca el campo, como en un campo de una línea.
        onMouseDown={(event) => {
          if (event.target !== event.currentTarget || disabled) return
          event.preventDefault()
          input.current?.focus()
        }}
        className={cn(
          inputShellClassName,
          inputMultilineRadiusClassName,
          // Los chips pueden ocupar varias filas, como `ComboboxChips`: el alto mínimo es el del tamaño.
          "h-auto! cursor-text flex-wrap gap-1 px-1 py-1 data-[size=sm]:min-h-7 data-[size=sm]:py-0.5 data-[size=md]:min-h-9 data-[size=lg]:min-h-10 pointer-coarse:data-[size=sm]:min-h-9 pointer-coarse:data-[size=md]:min-h-11",
          className
        )}
      >
        {tags.length > 0 && (
          <ul {...listLabel} data-slot="tags-input-list" role="list" className="contents">
            {tags.map((tag, index) => (
              // Índice y texto: una lista controlada puede traer repetidas.
              <li key={`${index}-${tag}`} className="flex">
                <Tag
                  onRemove={
                    disabled
                      ? undefined
                      : () => {
                          remove(index)
                          // El × desaparece con la etiqueta: el foco vuelve al campo.
                          input.current?.focus()
                        }
                  }
                  removeLabel={labels.remove}
                  size={size === "sm" ? "sm" : "md"}
                >
                  {tag}
                </Tag>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={inputRef}
          type="text"
          id={field.id}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={describedBy}
          aria-invalid={errors.length > 0 || field.invalid || undefined}
          autoComplete="off"
          disabled={disabled}
          enterKeyHint="enter"
          placeholder={placeholder}
          value={draft}
          onChange={(event) => {
            const text = event.currentTarget.value
            // La coma (o un separador) al final agrega lo de antes; lo de después sigue en el campo.
            if (separators?.test(text)) {
              const parts = text.split(separators)
              const rest = parts.pop() ?? ""
              add(parts)
              if (rest) setDraft((current) => (current ? `${current}, ${rest}` : rest))
              return
            }
            setDraft(text)
            if (errors.length) setErrors([])
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && enterAdds && !event.nativeEvent.isComposing) {
              // Con texto, Enter agrega y no envía el formulario; vacío, sigue siendo el Enter del form.
              if (draft.trim()) {
                event.preventDefault()
                add([draft])
              }
            } else if (event.key === "Backspace" && draft === "" && tags.length > 0 && !disabled) {
              event.preventDefault()
              remove(tags.length - 1)
            }
          }}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text")
            if (!separators?.test(text)) return
            event.preventDefault()
            // Lo pegado entra en el cursor (o reemplaza lo seleccionado) y recién ahí se separa.
            const start = event.currentTarget.selectionStart ?? draft.length
            const end = event.currentTarget.selectionEnd ?? start
            add(`${draft.slice(0, start)}${text}${draft.slice(end)}`.split(separators))
          }}
          onFocus={field.onFocus}
          onBlur={() => {
            // Con `addOnBlur`, la validación `onBlur` del `Field` ve la lista con la agregada.
            if (addOnBlur && draft.trim()) field.onBlur([...tags, ...add([draft]).added])
            else field.onBlur()
          }}
          className="h-6 min-w-24 flex-1 bg-transparent px-1.5 text-inherit outline-none placeholder:text-label-secondary disabled:cursor-not-allowed"
        />
      </div>
      {errors.length > 0 && (
        <div id={errorsId} data-slot="tags-input-errors" role="alert" className="flex flex-col gap-1 text-footnote text-red-ink">
          {errors.map((error, index) => (
            <p key={index} className="flex items-start gap-1.5">
              <CircleAlertIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}
      {field.name && tags.map((tag, index) => <input key={`${index}-${tag}`} name={field.name} type="hidden" value={tag} />)}
      {required && (
        // La validación nativa de `required`: fuera de la vista y del Tab, devuelve el foco al campo.
        <input
          ref={field.inputRef}
          aria-hidden="true"
          className="sr-only"
          disabled={disabled}
          onChange={() => {}}
          onFocus={() => input.current?.focus()}
          required
          tabIndex={-1}
          value={tags.join(",")}
        />
      )}
      <span className="sr-only" data-slot="tags-input-status" role="status">
        {status}
      </span>
    </div>
  )
}

export { TagsInput, tagsInputLabels, type TagsInputLabels, type TagsInputProps }
