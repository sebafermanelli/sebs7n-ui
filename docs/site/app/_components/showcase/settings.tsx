"use client"

import { BellIcon, BuildingIcon, CreditCardIcon, FileTextIcon, FolderIcon, HashIcon, ImageIcon, KeyRoundIcon, MailIcon, ReceiptIcon, ShieldCheckIcon, SmartphoneIcon, UsersIcon } from "lucide-react"
import type * as React from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { Card } from "sebs7n-ui/card"
import { List, ListRow, ListSection } from "sebs7n-ui/list-row"
import { Meter, StackedMeter } from "sebs7n-ui/meter"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Switch } from "sebs7n-ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { PromoCard, PromoCardLink } from "sebs7n-ui/widget-card"

const nada = () => {}

/** Una fila con un interruptor: el nombre de la fila es el del interruptor. */
function FilaSwitch({ titulo, detalle, icono, prendido = false }: { titulo: string; detalle?: string; icono: React.ReactNode; prendido?: boolean }) {
  return (
    <ListRow description={detalle} icon={icono} title={titulo}>
      <Switch aria-label={titulo} defaultChecked={prendido} />
    </ListRow>
  )
}

const ESPACIO = [
  { label: "Facturas", value: 13.5, color: "amber" as const },
  { label: "Documentos", value: 6.1, color: "purple" as const },
  { label: "Imágenes", value: 4, color: "teal" as const },
  { label: "Respaldos", value: 2.4, color: "green" as const }
]

/**
 * Ajustes: el plan con su uso (`PromoCard` + `Meter`) y las secciones de configuración en una `SettingsGrid`
 * (una columna, dos desde 48 rem del contenido, con las cabeceras y los pies de una fila alineados). El único
 * botón primario es «Guardar cambios»; el resto de las acciones son filas.
 */
export function SettingsShowcase() {
  return (
    <AppShellContent className="max-w-4xl">
      <PageHeader>
        <PageHeaderTitle>Ajustes</PageHeaderTitle>
        <PageHeaderDescription>El plan, el espacio, la facturación y la seguridad de la cuenta. Los cambios se aplican a todos los usuarios.</PageHeaderDescription>
        <PageHeaderActions>
          <Button>Guardar cambios</Button>
        </PageHeaderActions>
      </PageHeader>

      <Tabs defaultValue="general">
        <TabsList aria-label="Secciones de ajustes">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col gap-6 pt-4" value="general">
          <div className="grid gap-5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <PromoCard chip="12 de 15 usuarios" title="Plan Pro">
              <PromoCardLink render={<button type="button" />}>Cambiar de plan</PromoCardLink>
            </PromoCard>
            <Card className="flex flex-col justify-between gap-5 p-6">
              <div className="flex flex-col gap-1">
                <h4 className="text-title-2 text-label">Uso del plan</h4>
                <p className="text-callout text-label-secondary">412 de 500 facturas emitidas este mes. Te quedan 88.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Meter label="Cupo de facturas" locale="es-AR" max={500} showValue value={412} />
                <Meter label="Usuarios" locale="es-AR" max={15} showValue value={12} />
                <Meter format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }} label="Espacio" locale="es-AR" max={50} showValue value={26} />
              </div>
            </Card>
          </div>

          <SettingsGrid>
            <SettingsSection description="Razón social, usuarios y contacto." title="Cuenta">
              <List aria-label="Cuenta">
                <ListRow chevron description="Razón social y domicilio fiscal" icon={<BuildingIcon />} onClick={nada} title="Datos de la empresa" />
                <ListRow chevron icon={<UsersIcon />} onClick={nada} title="Usuarios" trailing="12" />
                <ListRow chevron description="admin@empresa.com" icon={<MailIcon />} onClick={nada} title="Correo de contacto" />
              </List>
            </SettingsSection>
            <SettingsSection description="Compartido entre los 12 usuarios del plan." title="Espacio">
              <div className="flex flex-col gap-4">
                <StackedMeter
                  aria-label="Espacio usado por tipo"
                  format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }}
                  legend
                  locale="es-AR"
                  max={50}
                  segments={ESPACIO}
                  total="50 GB"
                />
                <List aria-label="Qué usa el espacio">
                  <ListSection title="Usado por la cuenta" total="26 GB">
                    <ListRow description="1.204 comprobantes" dot="amber" icon={<FileTextIcon />} title="Facturas" trailing="13,5 GB" />
                    <ListRow description="Todos los archivos" dot="purple" icon={<FolderIcon />} title="Documentos" trailing="6,1 GB" />
                    <ListRow description="Logos y firmas" dot="teal" icon={<ImageIcon />} title="Imágenes" trailing="4 GB" />
                  </ListSection>
                </List>
              </div>
            </SettingsSection>
          </SettingsGrid>
        </TabsContent>

        <TabsContent className="pt-4" value="facturacion">
          <SettingsGrid>
            <SettingsSection description="Cómo se numeran y se cobran." title="Comprobantes">
              <List aria-label="Comprobantes">
                <ListRow chevron description="2 activos" icon={<ReceiptIcon />} onClick={nada} title="Puntos de venta" />
                <ListRow chevron icon={<HashIcon />} onClick={nada} title="Numeración" trailing="0001-00000124" />
                <ListRow chevron icon={<CreditCardIcon />} onClick={nada} title="Medios de cobro" trailing="3" />
              </List>
            </SettingsSection>
            <SettingsSection description="Qué recibe el cliente al emitir." title="Envío">
              <List aria-label="Envío">
                <FilaSwitch detalle="Con el PDF adjunto" icono={<MailIcon />} prendido titulo="Mandar la factura por correo" />
                <FilaSwitch detalle="Tres días antes" icono={<BellIcon />} titulo="Recordar el vencimiento" />
              </List>
            </SettingsSection>
          </SettingsGrid>
        </TabsContent>

        <TabsContent className="pt-4" value="seguridad">
          <SettingsGrid>
            <SettingsSection description="Cómo entran los usuarios." title="Acceso" wide>
              <List aria-label="Acceso">
                <FilaSwitch detalle="Código en cada inicio de sesión" icono={<ShieldCheckIcon />} prendido titulo="Verificación en dos pasos" />
                <ListRow chevron icon={<KeyRoundIcon />} onClick={nada} title="Llaves de acceso" trailing="2" />
                <ListRow chevron icon={<SmartphoneIcon />} onClick={nada} title="Dispositivos" trailing="4" />
              </List>
            </SettingsSection>
          </SettingsGrid>
        </TabsContent>

        <TabsContent className="pt-4" value="avisos">
          <SettingsGrid>
            <SettingsSection description="Cuándo te escribimos." title="Avisos" wide>
              <List aria-label="Avisos">
                <FilaSwitch detalle="Cuando un cliente paga" icono={<CreditCardIcon />} prendido titulo="Cobros" />
                <FilaSwitch detalle="El lunes a la mañana" icono={<MailIcon />} prendido titulo="Resumen semanal" />
                <FilaSwitch detalle="Altas, bajas y cambios de permisos" icono={<UsersIcon />} titulo="Cambios de usuarios" />
              </List>
            </SettingsSection>
          </SettingsGrid>
        </TabsContent>
      </Tabs>
    </AppShellContent>
  )
}
