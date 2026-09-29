import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// `internal/field-control` usa hooks de `@base-ui/react/internals/*` para que los controles propios
// (DropZone, DatePicker, TimePicker, Toggle, TagsInput, Rating…) se registren en `Field` y `Form`
// como los de Base UI. No son API documentada: pueden cambiar en cualquier versión. Este test rompe
// si desaparecen o cambian de forma, y el peer queda acotado a la versión en que pasa.
describe("Base UI internals que usa el paquete", () => {
  it("existen con la forma que espera field-control", async () => {
    const root = await import("@base-ui/react/internals/field-root-context")
    const register = await import("@base-ui/react/internals/field-register-control")
    const form = await import("@base-ui/react/internals/form-context")
    const labelable = await import("@base-ui/react/internals/labelable-provider")
    expect(typeof root.useFieldRootContext).toBe("function")
    expect(typeof register.useRegisterFieldControl).toBe("function")
    expect(typeof form.useFormContext).toBe("function")
    expect(typeof labelable.useLabelableContext).toBe("function")
    expect(typeof labelable.useLabelableId).toBe("function")
    // El contexto por defecto (afuera de un Field) trae lo que field-control lee.
    const defaults = root.FieldRootContext as unknown as { _currentValue: Record<string, unknown> }
    for (const key of ["registerFieldControl", "setTouched", "setFilled", "setDirty", "setFocused", "validation", "validityData", "state"]) {
      expect(defaults._currentValue).toHaveProperty(key)
    }
  })

  it("el peer de Base UI está acotado a la versión menor probada", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"))
    const installed = JSON.parse(readFileSync(join(process.cwd(), "node_modules/@base-ui/react/package.json"), "utf8")).version as string
    const [major, minor] = installed.split(".")
    expect(pkg.peerDependencies["@base-ui/react"]).toBe(`>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0`)
  })
})
