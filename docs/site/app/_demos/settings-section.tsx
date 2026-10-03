import { Field, FieldDescription, FieldLabel } from "sebs7n-ui/field"
import { Input } from "sebs7n-ui/input"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Switch } from "sebs7n-ui/switch"

/**
 * Secciones en dos columnas
 * Una columna en el teléfono y dos desde `lg`; las cards de una fila comparten el alto de cabecera y de cuerpo. `wide` ocupa las dos.
 */
export function Basic() {
  return (
    <SettingsGrid className="w-full">
      <SettingsSection description="Cómo se llama y cómo se ve." title="Perfil">
        <Field name="name">
          <FieldLabel>Nombre</FieldLabel>
          <Input defaultValue="Equipo de ejemplo" />
        </Field>
        <Field name="site">
          <FieldLabel>Sitio</FieldLabel>
          <Input defaultValue="ejemplo.com" />
          <FieldDescription>Se muestra en el pie de los documentos.</FieldDescription>
        </Field>
      </SettingsSection>
      <SettingsSection description="Qué avisos llegan y por dónde." title="Avisos">
        <div className="flex items-center justify-between gap-4">
          <span className="text-callout text-label">Por correo</span>
          <Switch aria-label="Avisos por correo" defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-callout text-label">En la app</span>
          <Switch aria-label="Avisos en la app" />
        </div>
      </SettingsSection>
      <SettingsSection description="Ocupa las dos columnas." title="Avanzado" wide>
        <p className="text-callout text-label-secondary">Un contenido ancho: una tabla, una zona de arrastre.</p>
      </SettingsSection>
    </SettingsGrid>
  )
}
