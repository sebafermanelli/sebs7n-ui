"use client"

import { useId } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { RadioGroup, RadioGroupItem } from "sebs7n-ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Switch } from "sebs7n-ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { toast } from "sonner"

const TIMEZONES = {
  "America/Argentina/Buenos_Aires": "Buenos Aires (GMT−3)",
  "America/Mexico_City": "Ciudad de México (GMT−6)",
  "Europe/Madrid": "Madrid (GMT+2)",
}
const DUE_DAYS = { "15": "15 días", "30": "30 días", "45": "45 días", "60": "60 días" }
const CURRENCIES = [
  { value: "USD", label: "Dólar estadounidense (USD)" },
  { value: "ARS", label: "Peso argentino (ARS)" },
  { value: "EUR", label: "Euro (EUR)" },
]
const NOTIFICATIONS = [
  { id: "overdue", label: "Factura vencida", hint: "Cuando una factura pasa su vencimiento sin cobrarse.", on: true },
  { id: "paid", label: "Cobro recibido", hint: "Cada vez que se marca una factura como cobrada.", on: true },
  { id: "weekly", label: "Resumen semanal", hint: "Los lunes, lo facturado y lo cobrado de la semana.", on: false },
]

// El template no persiste nada: guardar confirma y listo. Los valores no cambian el resto (YAGNI).
const saved = () => toast.success("Cambios guardados.")

export default function SettingsPage() {
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Configuración</PageHeaderTitle>
        <PageHeaderDescription>Los datos de la empresa, cómo se factura y qué avisos llegan.</PageHeaderDescription>
      </PageHeader>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        <TabsContent className="pt-6" value="general">
          <GeneralForm />
        </TabsContent>
        <TabsContent className="pt-6" value="billing">
          <BillingForm />
        </TabsContent>
        <TabsContent className="pt-6" value="notifications">
          <NotificationsPanel />
        </TabsContent>
      </Tabs>
    </AppShellContent>
  )
}

function GeneralForm() {
  return (
    <Form className="max-w-md" onFormSubmit={saved}>
      <Field name="company">
        <FieldLabel required>Nombre de la empresa</FieldLabel>
        <Input defaultValue="Acme Corporation" required />
        <FieldError match="valueMissing">Falta el nombre de la empresa</FieldError>
      </Field>
      <Field name="timezone">
        <FieldLabel>Zona horaria</FieldLabel>
        <Select defaultValue="America/Argentina/Buenos_Aires" items={TIMEZONES}>
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
      <Button className="self-start" type="submit">
        Guardar cambios
      </Button>
    </Form>
  )
}

function BillingForm() {
  const currencyLabel = useId()
  return (
    <Form className="max-w-md" onFormSubmit={saved}>
      <div className="flex flex-col gap-3">
        <div className="text-callout text-label" id={currencyLabel}>
          Moneda de las facturas
        </div>
        <RadioGroup aria-labelledby={currencyLabel} className="flex flex-col gap-3" defaultValue="USD" name="currency">
          {CURRENCIES.map((currency) => (
            <CurrencyOption key={currency.value} {...currency} />
          ))}
        </RadioGroup>
      </div>
      <Field name="dueDays">
        <FieldLabel>Vencimiento por defecto</FieldLabel>
        <Select defaultValue="30" items={DUE_DAYS}>
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
      <Button className="self-start" type="submit">
        Guardar cambios
      </Button>
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

// Un `Switch` aplica en el momento: sin «Guardar». Si hiciera falta guardar, serían `Checkbox`.
function NotificationsPanel() {
  return (
    <Card className="max-w-xl">
      <CardContent className="flex flex-col gap-5">
        {NOTIFICATIONS.map((notification) => (
          <NotificationRow key={notification.id} {...notification} />
        ))}
      </CardContent>
    </Card>
  )
}

function NotificationRow({ label, hint, on }: { label: string; hint: string; on: boolean }) {
  const id = useId()
  const hintId = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-footnote text-label-secondary" id={hintId}>
          {hint}
        </p>
      </div>
      <Switch aria-describedby={hintId} defaultChecked={on} id={id} />
    </div>
  )
}
