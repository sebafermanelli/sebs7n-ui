"use client"

import { useState } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { toast } from "sonner"

import { SettingsBilling } from "../_components/settings-billing"
import { SettingsGeneral } from "../_components/settings-general"
import { SettingsNotifications } from "../_components/settings-notifications"
import { TeamPanel } from "../_components/team-panel"
import { LAST_MONTH } from "../_data/derive"
import { applyKeys, BILLING_KEYS, GENERAL_KEYS } from "../_lib/settings"
import { useInvoicesStore } from "../_state/invoices-context"

export default function SettingsPage() {
  const { settings: saved, saveSettings, invoices } = useInvoicesStore()
  // Lo que se edita es un borrador: «Guardar» lo vuelve la configuración y «Descartar» lo tira. Cada pestaña
  // guarda solo lo suyo, así que guardar General no guarda los cambios a medias de Facturación.
  const [draft, setDraft] = useState(saved)
  const save = (keys: typeof GENERAL_KEYS | typeof BILLING_KEYS) => {
    saveSettings(applyKeys(saved, draft, keys))
    toast.success("Cambios guardados.")
  }
  const discard = (keys: typeof GENERAL_KEYS | typeof BILLING_KEYS) => setDraft(applyKeys(draft, saved, keys))

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Configuración</PageHeaderTitle>
        <PageHeaderDescription>Empresa, facturación, equipo y avisos.</PageHeaderDescription>
      </PageHeader>
      <Tabs defaultValue="general">
        {/* La línea de la tira se sale 8 px de cada lado para alinear el texto: a la derecha, esos 8 px
            pasaban el borde del contenido. Se le saca ese lado. */}
        <TabsList className="w-[calc(100%+0.5rem)]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        <TabsContent className="pt-6" value="general">
          <SettingsGeneral draft={draft} onDiscard={() => discard(GENERAL_KEYS)} onDraftChange={setDraft} onSave={() => save(GENERAL_KEYS)} saved={saved} />
        </TabsContent>
        <TabsContent className="pt-6" value="billing">
          <SettingsBilling draft={draft} invoices={invoices} month={LAST_MONTH} onDiscard={() => discard(BILLING_KEYS)} onDraftChange={setDraft} onSave={() => save(BILLING_KEYS)} saved={saved} />
        </TabsContent>
        <TabsContent className="pt-6" value="team">
          <TeamPanel />
        </TabsContent>
        <TabsContent className="pt-6" value="notifications">
          <SettingsNotifications />
        </TabsContent>
      </Tabs>
    </AppShellContent>
  )
}
