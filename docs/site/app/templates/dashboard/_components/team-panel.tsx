"use client"

import { UserPlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "sebs7n-ui/alert-dialog"
import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Field, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { List, ListRow } from "sebs7n-ui/list-row"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { toast } from "sonner"

import { ASSIGNABLE_ROLES, initials, ROLE_LABELS, type Role, type TeamMember } from "../_data/team-mock"
import { useInvoicesStore } from "../_state/invoices-context"

// Quitar es reversible (el equipo vuelve a cómo estaba), así que va con confirmación y «Deshacer»: la
// confirmación porque quita un acceso, el «Deshacer» porque un clic mal dado no debería costar una invitación nueva.
export function TeamPanel() {
  const { team, inviteMember, removeMember, restoreTeam, changeRole } = useInvoicesStore()
  const [removing, setRemoving] = useState<TeamMember | null>(null)

  return (
    <SettingsGrid className="@4xl:grid-cols-[minmax(0,1fr)_22rem]">
      <SettingsSection description={`${team.length} personas con acceso. Los roles definen qué pueden hacer.`} title="Miembros">
        <List aria-label="Equipo">
          {team.map((member) => (
            <ListRow
              description={member.email}
              icon={
                <Avatar size="sm">
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
              }
              key={member.id}
              title={member.name}
              trailing={
                member.role === "owner" ? (
                  <Badge color="gray">{ROLE_LABELS.owner}</Badge>
                ) : (
                  <span className="flex items-center gap-1">
                    <Select
                      items={ASSIGNABLE_ROLES}
                      onValueChange={(value) => {
                        if (!value) return
                        changeRole(member.id, value as Role)
                        toast.success(`${member.name} ahora es ${ROLE_LABELS[value as Role].toLocaleLowerCase("es")}.`)
                      }}
                      value={member.role}
                    >
                      <SelectTrigger aria-label={`Rol de ${member.name}`} className="w-40" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASSIGNABLE_ROLES).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger render={<Button aria-label={`Quitar a ${member.name}`} onClick={() => setRemoving(member)} size="icon-sm" variant="plain" />}>
                        <XIcon />
                      </TooltipTrigger>
                      <TooltipContent>Quitar acceso</TooltipContent>
                    </Tooltip>
                  </span>
                )
              }
            />
          ))}
        </List>
      </SettingsSection>
      <InviteCard existingEmails={team.map((member) => member.email)} onInvite={inviteMember} />

      {removing && (
        <AlertDialog onOpenChange={(open) => !open && setRemoving(null)} open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Quitar a {removing.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Pierde el acceso a Acme Facturación ahora mismo. Podés volver a invitarla o deshacerlo desde el aviso que aparece después.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  const previous = removeMember(removing.id)
                  toast.info(`${removing.name} ya no tiene acceso.`, {
                    action: {
                      label: "Deshacer",
                      onClick: () => restoreTeam(previous)
                    }
                  })
                  setRemoving(null)
                }}
                variant="destructive"
              >
                Quitar acceso
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SettingsGrid>
  )
}

function InviteCard({ existingEmails, onInvite }: { existingEmails: string[]; onInvite: (email: string, role: Exclude<Role, "owner">) => TeamMember }) {
  const [duplicate, setDuplicate] = useState(false)
  // Cambiar la `key` vacía el formulario después de invitar.
  const [round, setRound] = useState(0)
  return (
    <SettingsSection description="Le llega un correo con el acceso. Podés cambiar su rol cuando quieras." title="Invitar al equipo">
      <Form
        key={round}
        onFormSubmit={(values) => {
          const email = String(values.email).trim().toLocaleLowerCase("es")
          if (existingEmails.some((existing) => existing.toLocaleLowerCase("es") === email)) {
            setDuplicate(true)
            return
          }
          onInvite(email, (values.role as Exclude<Role, "owner">) ?? "member")
          toast.success(`Invitación enviada a ${email}.`)
          setDuplicate(false)
          setRound((value) => value + 1)
        }}
      >
        <Field invalid={duplicate} name="email">
          <FieldLabel required>Correo</FieldLabel>
          <Input onChange={() => setDuplicate(false)} placeholder="nombre@empresa.com" required type="email" />
          <FieldError match="valueMissing">Falta el correo</FieldError>
          <FieldError match="typeMismatch">Escribí un correo válido</FieldError>
          <FieldError match={duplicate}>Esa persona ya tiene acceso</FieldError>
        </Field>
        <Field name="role">
          <FieldLabel>Rol</FieldLabel>
          <Select defaultValue="member" items={ASSIGNABLE_ROLES}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ASSIGNABLE_ROLES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button type="submit">
          <UserPlusIcon />
          Invitar
        </Button>
      </Form>
    </SettingsSection>
  )
}
