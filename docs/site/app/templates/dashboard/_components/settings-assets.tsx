"use client"

import { Trash2Icon } from "lucide-react"
import { useId } from "react"
import { ColorPicker } from "sebs7n-ui/color-picker"
import { ContextMenuItem } from "sebs7n-ui/context-menu"
import { DropZone } from "sebs7n-ui/drop-zone"
import { Field, FieldDescription, FieldLabel } from "sebs7n-ui/field"
import { FileGrid } from "sebs7n-ui/file-grid"
import { hexOfOklch, type Oklch } from "sebs7n-ui/lib/contrast"
import { SettingsSection } from "sebs7n-ui/settings-section"

import { attach, fileSizeLabel, type AttachedFile } from "../_lib/settings"

interface SettingsAssetsProps {
  brand: Oklch
  onBrandChange: (brand: Oklch) => void
  logo: AttachedFile | null
  onLogoChange: (logo: AttachedFile | null) => void
  documents: AttachedFile[]
  onDocumentsChange: (documents: AttachedFile[]) => void
}

const MAX_SIZE = 5 * 1024 * 1024

// Marca y archivos de la empresa, en su archivo para pedirlos recién después de hidratar (`lazy` en
// `settings-general`): ColorPicker, DropZone y FileGrid no hacen falta para pintar la pantalla.
export default function SettingsAssets({ brand, onBrandChange, logo, onLogoChange, documents, onDocumentsChange }: SettingsAssetsProps) {
  const brandId = useId()
  return (
    <>
      <SettingsSection description="Cómo se ve tu empresa en los PDF y en el link de pago." title="Marca">
        <div className="flex flex-col gap-2">
          <label className="text-callout text-label" htmlFor={brandId}>
            Color de la marca
          </label>
          <ColorPicker
            footer={(color) => (
              <div className="flex h-10 items-center justify-center rounded-control text-callout font-medium text-white" style={{ backgroundColor: hexOfOklch(color) }}>
                Vista previa del botón
              </div>
            )}
            id={brandId}
            onValueChange={onBrandChange}
            value={brand}
          />
          <p className="text-footnote text-label-secondary">Se usa en los PDF de las facturas y en el link de pago.</p>
        </div>

        <Field>
          <FieldLabel>Logo</FieldLabel>
          {/* Un solo archivo: el nuevo reemplaza al anterior. */}
          <DropZone
            accept="image/*"
            compact
            files={[]}
            maxSize={MAX_SIZE}
            onFilesChange={(files) =>
              files[0] &&
              onLogoChange({
                id: `logo-${files[0].name}`,
                name: files[0].name,
                size: files[0].size
              })
            }
          />
          <FieldDescription>{logo ? `Logo actual: ${logo.name} (${fileSizeLabel(logo.size)}).` : "PNG o SVG, hasta 5 MB. Todavía no cargaste uno."}</FieldDescription>
        </Field>
      </SettingsSection>

      <SettingsSection description="Constancias fiscales y otros documentos que se adjuntan a las facturas." title="Comprobantes" wide>
        <Field>
          <FieldLabel>Comprobantes y constancias</FieldLabel>
          <DropZone accept=".pdf,image/*" files={[]} maxFiles={10} maxSize={MAX_SIZE} multiple onFilesChange={(files) => onDocumentsChange(attach(documents, files))} />
          <FieldDescription>PDF o imagen, hasta 5 MB cada uno.</FieldDescription>
          {documents.length > 0 && (
            <FileGrid
              aria-label="Archivos cargados"
              items={documents.map((file) => ({
                id: file.id,
                name: file.name,
                kind: fileSizeLabel(file.size)
              }))}
              // El mismo menú desde el click derecho, Shift+F10 y el «…» de cada archivo.
              menu={(item) => (
                <ContextMenuItem onClick={() => onDocumentsChange(documents.filter((file) => file.id !== item.id))} variant="destructive">
                  <Trash2Icon />
                  Quitar «{item.name}»
                </ContextMenuItem>
              )}
            />
          )}
        </Field>
      </SettingsSection>
    </>
  )
}
