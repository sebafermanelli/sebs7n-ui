"use client"

import { lazy, Suspense, useEffect, useState } from "react"
import { Field, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Skeleton } from "sebs7n-ui/skeleton"

import { GENERAL_KEYS, isDirty, type Settings } from "../_lib/settings"
import { SettingsSaveBar } from "./settings-save-bar"

// La marca y los archivos traen ColorPicker, DropZone y FileGrid: se piden después de hidratar (`lazy` y
// montado en un efecto, para que no entren en lo que la pantalla pide al abrir).
const SettingsAssets = lazy(() => import("./settings-assets"))

export const TIMEZONES = {
  "America/Argentina/Buenos_Aires": "Buenos Aires (GMT−3)",
  "America/Mexico_City": "Ciudad de México (GMT−6)",
  "Europe/Madrid": "Madrid (GMT+2)"
}

interface SettingsGeneralProps {
  saved: Settings
  draft: Settings
  onDraftChange: (draft: Settings) => void
  onSave: () => void
  onDiscard: () => void
}

export function SettingsGeneral({ saved, draft, onDraftChange, onSave, onDiscard }: SettingsGeneralProps) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onDraftChange({ ...draft, [key]: value })

  return (
    <Form onFormSubmit={onSave}>
      <SettingsGrid>
        <SettingsSection description="El nombre que ven tus clientes y la hora en que se emiten las facturas." title="Empresa">
          <Field name="company">
            <FieldLabel required>Nombre de la empresa</FieldLabel>
            <Input onChange={(event) => set("company", event.target.value)} required value={draft.company} />
            <FieldError match="valueMissing">Falta el nombre de la empresa</FieldError>
          </Field>
          <Field name="timezone">
            <FieldLabel>Zona horaria</FieldLabel>
            <Select items={TIMEZONES} onValueChange={(value) => value && set("timezone", value)} value={draft.timezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIMEZONES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </SettingsSection>
        {hydrated ? (
          <Suspense fallback={<AssetsSkeleton />}>
            <SettingsAssets
              brand={draft.brand}
              documents={draft.documents}
              logo={draft.logo}
              onBrandChange={(brand) => set("brand", brand)}
              onDocumentsChange={(documents) => set("documents", documents)}
              onLogoChange={(logo) => set("logo", logo)}
            />
          </Suspense>
        ) : (
          <AssetsSkeleton />
        )}
      </SettingsGrid>
      <SettingsSaveBar dirty={isDirty(saved, draft, GENERAL_KEYS)} onDiscard={onDiscard} />
    </Form>
  )
}

// Del alto de lo que va a llegar: la pantalla no salta.
function AssetsSkeleton() {
  return (
    <>
      <SettingsSection aria-busy="true" description="Cómo se ve tu empresa en los PDF y en el link de pago." title="Marca">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full" />
      </SettingsSection>
      <SettingsSection aria-busy="true" description="Constancias fiscales y otros documentos que se adjuntan a las facturas." title="Comprobantes" wide>
        <Skeleton className="h-32 w-full" />
      </SettingsSection>
    </>
  )
}
