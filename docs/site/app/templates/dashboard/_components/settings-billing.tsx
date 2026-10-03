"use client"

import { useId } from "react"
import { CheckboxGroup, CheckboxGroupItem } from "sebs7n-ui/checkbox-group"
import { Field, FieldDescription, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Label } from "sebs7n-ui/label"
import { RadioGroup, RadioGroupItem } from "sebs7n-ui/radio-group"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"

import type { Invoice } from "../_data/invoices-mock"
import { TEAM_MOCK } from "../_data/team-mock"
import { BILLING_KEYS, isDirty, planOverview, type Settings } from "../_lib/settings"
import { PlanCard } from "./plan-card"
import { SettingsSaveBar } from "./settings-save-bar"

const DUE_DAYS = {
  "15": "15 días",
  "30": "30 días",
  "45": "45 días",
  "60": "60 días"
}
const CURRENCIES = [
  { value: "USD", label: "Dólar estadounidense (USD)" },
  { value: "ARS", label: "Peso argentino (ARS)" },
  { value: "EUR", label: "Euro (EUR)" }
]
const NOTICES = [
  { value: "before", label: "Tres días antes de vencer" },
  { value: "overdue", label: "El día que vence" },
  { value: "paid", label: "Cuando se registra el pago" }
]

interface SettingsBillingProps {
  saved: Settings
  draft: Settings
  invoices: Invoice[]
  /** El mes (`YYYY-MM`) del que se cuenta el cupo del plan. */
  month: string
  onDraftChange: (draft: Settings) => void
  onSave: () => void
  onDiscard: () => void
}

export function SettingsBilling({ saved, draft, invoices, month, onDraftChange, onSave, onDiscard }: SettingsBillingProps) {
  const currencyLabel = useId()
  const overview = planOverview(invoices, month, TEAM_MOCK.length)
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onDraftChange({ ...draft, [key]: value })

  return (
    <Form onFormSubmit={onSave}>
      <PlanCard overview={overview} />
      <SettingsGrid>
        <SettingsSection description="En qué moneda se emiten las facturas nuevas." title="Moneda">
          <div className="flex flex-col gap-3">
            <div className="text-callout text-label" id={currencyLabel}>
              Moneda de las facturas
            </div>
            <RadioGroup
              aria-labelledby={currencyLabel}
              className="flex flex-col gap-3"
              name="currency"
              onValueChange={(value) => set("currency", String(value))}
              value={draft.currency}
            >
              {CURRENCIES.map((currency) => (
                <CurrencyOption key={currency.value} {...currency} />
              ))}
            </RadioGroup>
          </div>
        </SettingsSection>
        <SettingsSection description="Cuántos días tiene el cliente para pagar." title="Vencimiento">
          <Field name="dueDays">
            <FieldLabel>Vencimiento por defecto</FieldLabel>
            <Select items={DUE_DAYS} onValueChange={(value) => value && set("dueDays", value)} value={draft.dueDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DUE_DAYS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Se usa en cada factura nueva.</FieldDescription>
          </Field>
        </SettingsSection>
        {/* Casillas que se aplican al apretar «Guardar»: por eso Checkbox y no Switch. */}
        <SettingsSection description="Cuándo recibe el cliente un recordatorio." title="Recordatorios">
          <Field name="customerNotices">
            <FieldLabel>Avisos al cliente</FieldLabel>
            <CheckboxGroup onValueChange={(value) => set("customerNotices", value)} value={draft.customerNotices}>
              {NOTICES.map((notice) => (
                <CheckboxGroupItem key={notice.value} value={notice.value}>
                  {notice.label}
                </CheckboxGroupItem>
              ))}
            </CheckboxGroup>
            <FieldDescription>Le llega un correo con el link de pago.</FieldDescription>
          </Field>
        </SettingsSection>
      </SettingsGrid>
      <SettingsSaveBar dirty={isDirty(saved, draft, BILLING_KEYS)} onDiscard={onDiscard} />
    </Form>
  )
}

function CurrencyOption({ value, label }: { value: string; label: string }) {
  const id = useId()
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem id={id} value={value} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}
