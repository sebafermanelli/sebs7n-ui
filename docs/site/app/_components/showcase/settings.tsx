"use client"

import {
  BellIcon,
  BuildingIcon,
  CreditCardIcon,
  FileTextIcon,
  FolderIcon,
  HashIcon,
  ImageIcon,
  KeyRoundIcon,
  MailIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  UsersIcon,
} from "lucide-react"
import { useId } from "react"
import type * as React from "react"
import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { Card } from "sebs7n-ui/card"
import { List, ListRow, ListSection } from "sebs7n-ui/list-row"
import { StackedMeter } from "sebs7n-ui/meter"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Switch } from "sebs7n-ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { PromoCard, PromoCardLink } from "sebs7n-ui/widget-card"

import { AppIcon } from "./parts"

const nada = () => {}

/** Un grupo de filas con su título, en una card: el bloque de Settings de iCloud. */
function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h4 className="px-1 text-title-3 text-label" id={id}>
        {titulo}
      </h4>
      <Card className="p-1.5">
        <List aria-labelledby={id}>{children}</List>
      </Card>
    </section>
  )
}

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
  { label: "Respaldos", value: 2.4, color: "green" as const },
]

/** Settings de iCloud: título de 48, las pestañas subrayadas, la barra de espacio y las filas agrupadas. */
export function SettingsShowcase() {
  return (
    <div className="@container h-full overflow-y-auto bg-background">
      <Navbar>
        <NavbarContent>
          <span className="flex items-center gap-2 text-headline text-label">
            <AppIcon fill="gray" icon={BuildingIcon} size="sm" />
            Cuenta
          </span>
          <Avatar size="sm">
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
        </NavbarContent>
      </Navbar>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pt-10 pb-12 @3xl:px-8">
        <PageHeader>
          <PageHeaderTitle>Ajustes</PageHeaderTitle>
          <PageHeaderDescription>
            El plan, el espacio, la facturación y la seguridad de la cuenta. Los cambios se aplican a todos los usuarios.
          </PageHeaderDescription>
        </PageHeader>

        <Tabs defaultValue="general">
          <TabsList aria-label="Secciones de ajustes">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            <TabsTrigger value="avisos">Avisos</TabsTrigger>
          </TabsList>

          <TabsContent className="flex flex-col gap-8 pt-2" value="general">
            <div className="grid gap-5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <PromoCard chip="12 usuarios" title="Plan Pro">
                <PromoCardLink render={<button type="button" />}>Plan</PromoCardLink>
                <PromoCardLink render={<button type="button" />}>Beneficios</PromoCardLink>
              </PromoCard>
              <Card className="flex flex-col justify-between gap-5 p-6">
                <div className="flex flex-col gap-1">
                  <h4 className="text-title-2 text-label" id="muestra-espacio">
                    Espacio
                  </h4>
                  <p className="text-callout text-label-secondary">Compartido entre los 12 usuarios del plan.</p>
                </div>
                <StackedMeter
                  aria-labelledby="muestra-espacio"
                  format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }}
                  legend
                  locale="es-AR"
                  max={50}
                  segments={ESPACIO}
                  total="50 GB"
                />
              </Card>
            </div>

            <Grupo titulo="Cuenta">
              <ListRow chevron description="Razón social y domicilio fiscal" icon={<BuildingIcon />} onClick={nada} title="Datos de la empresa" />
              <ListRow chevron icon={<UsersIcon />} onClick={nada} title="Usuarios" trailing="12" />
              <ListRow chevron icon={<MailIcon />} onClick={nada} title="Correo de contacto" trailing="admin@empresa.com" />
            </Grupo>

            <Card className="p-1.5">
              <List aria-label="Qué usa el espacio">
                <ListSection title="Usado por la cuenta" total="26 GB">
                <ListRow description="1.204 comprobantes" dot="amber" icon={<FileTextIcon />} inline title="Facturas" trailing="13,5 GB" />
                <ListRow description="Todos los archivos" dot="purple" icon={<FolderIcon />} inline title="Documentos" trailing="6,1 GB" />
                <ListRow description="Logos y firmas" dot="teal" icon={<ImageIcon />} inline title="Imágenes" trailing="4 GB" />
                <ListRow description="Copias automáticas" dot="green" icon={<FolderIcon />} inline title="Respaldos" trailing="2,4 GB" />
                </ListSection>
              </List>
            </Card>
          </TabsContent>

          <TabsContent className="flex flex-col gap-8 pt-2" value="facturacion">
            <Grupo titulo="Comprobantes">
              <ListRow chevron description="2 activos" icon={<ReceiptIcon />} onClick={nada} title="Puntos de venta" />
              <ListRow chevron icon={<HashIcon />} onClick={nada} title="Numeración" trailing="0001-00000124" />
              <ListRow chevron icon={<CreditCardIcon />} onClick={nada} title="Medios de cobro" trailing="3" />
            </Grupo>
            <Grupo titulo="Envío">
              <FilaSwitch detalle="Con el PDF adjunto" icono={<MailIcon />} prendido titulo="Mandar la factura por correo" />
              <FilaSwitch detalle="Tres días antes" icono={<BellIcon />} titulo="Recordar el vencimiento" />
            </Grupo>
          </TabsContent>

          <TabsContent className="flex flex-col gap-8 pt-2" value="seguridad">
            <Grupo titulo="Acceso">
              <FilaSwitch detalle="Código en cada inicio de sesión" icono={<ShieldCheckIcon />} prendido titulo="Verificación en dos pasos" />
              <ListRow chevron icon={<KeyRoundIcon />} onClick={nada} title="Llaves de acceso" trailing="2" />
              <ListRow chevron icon={<SmartphoneIcon />} onClick={nada} title="Dispositivos" trailing="4" />
            </Grupo>
          </TabsContent>

          <TabsContent className="flex flex-col gap-8 pt-2" value="avisos">
            <Grupo titulo="Avisos">
              <FilaSwitch detalle="Cuando un cliente paga" icono={<CreditCardIcon />} prendido titulo="Cobros" />
              <FilaSwitch detalle="El lunes a la mañana" icono={<MailIcon />} prendido titulo="Resumen semanal" />
              <FilaSwitch detalle="Altas, bajas y cambios de permisos" icono={<UsersIcon />} titulo="Cambios de usuarios" />
            </Grupo>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
