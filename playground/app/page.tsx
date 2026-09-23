import {
  Alert, AlertDescription, AlertTitle, Avatar, AvatarFallback, Badge, BADGE_COLORS, Button, buttonVariants,
  Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox,
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger, Input, Label, Popover, PopoverContent,
  PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger, RadioGroup, RadioGroupItem, Select,
  SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Sheet, SheetContent, SheetDescription,
  SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, Switch, Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Toggle,
  Tooltip, TooltipContent, TooltipTrigger, TYPE_SCALE,
} from "sebs7n-ui"
import { InfoIcon, MoreHorizontalIcon, PlusIcon, TriangleAlertIcon } from "lucide-react"
import type * as React from "react"

import { ComboboxDemo } from "./combobox-demo"
import { Controls } from "./controls"
import { MiscDemo, ShellDemo } from "./shell-demo"

const SCALES = ["gray", "gray-alpha", "brand", "blue", "red", "amber", "green", "teal", "purple", "pink"] as const
const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] as const
const VARIANTS = ["default", "outline", "secondary", "ghost", "accent", "destructive", "link"] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-gray-400 py-10">
      <h2 className="text-heading-24">{title}</h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col px-6 py-12">
      <header className="flex flex-col gap-4 pb-10">
        <h1 className="text-heading-32">sebs7n-ui</h1>
        <p className="text-copy-16 text-gray-900">Geist + shadcn/ui base-nova. Pasá el mouse y navegá con Tab para ver hover y foco.</p>
        <Controls />
      </header>

      <Section title="Shell">
        <p className="text-copy-14 text-gray-900">AppShell + Sidebar + UserMenu + PageHeader + Stat + EmptyState. Debajo de lg, la hamburguesa abre el sidebar en un Sheet.</p>
        <ShellDemo />
      </Section>

      <Section title="Kbd · ThemeSwitcher · AlertDialog · Sidebar colapsado">
        <MiscDemo />
      </Section>

      <Section title="Tipografía">
        <div className="grid gap-2">
          {TYPE_SCALE.map((name) => (
            <div key={name} className="flex items-baseline gap-4">
              <code className="w-32 shrink-0 text-label-12-mono text-gray-900">{name}</code>
              <span className={`text-${name}`}>Acme Corp $48.200,00</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Color">
        <div className="grid gap-2">
          {SCALES.map((scale) => (
            <div key={scale} className="grid grid-cols-[6rem_repeat(10,1fr)] items-center gap-1">
              <code className="text-label-12-mono text-gray-900">{scale}</code>
              {STEPS.map((step) => (
                <div key={step} className={`bg-${scale}-${step} h-8 rounded-md`} title={`${scale}-${step}`} />
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button">
        {VARIANTS.map((variant) => (
          <Row key={variant}>
            <code className="w-24 text-label-12-mono text-gray-900">{variant}</code>
            <Button variant={variant} size="sm">Small</Button>
            <Button variant={variant}>Medium</Button>
            <Button variant={variant} size="lg">Large</Button>
            <Button variant={variant} size="icon-md" aria-label="Agregar"><PlusIcon /></Button>
            <Button variant={variant} disabled>Disabled</Button>
            <Button variant={variant} loading>Loading</Button>
          </Row>
        ))}
        <Row>
          <a href="#" className={buttonVariants({ variant: "outline" })}>Link con buttonVariants()</a>
        </Row>
      </Section>

      <Section title="Campos">
        <div className="grid max-w-xl gap-4">
          <div className="grid gap-2"><Label htmlFor="a" required>Nombre</Label><Input id="a" placeholder="Ana Pérez" /></div>
          <div className="grid gap-2"><Label htmlFor="b">Inválido</Label><Input id="b" aria-invalid defaultValue="no-es-un-email" /><p className="text-copy-13 text-red-900">Ingresá un email válido.</p></div>
          <div className="grid gap-2"><Label htmlFor="c">Deshabilitado</Label><Input id="c" disabled defaultValue="Solo lectura" /></div>
          <Row><Input size="sm" placeholder="sm" /><Input placeholder="md" /><Input size="lg" placeholder="lg" /></Row>
          <Select>
            <SelectTrigger aria-label="Moneda"><SelectValue placeholder="Elegí una moneda" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ars">ARS — Peso</SelectItem>
              <SelectItem value="usd">USD — Dólar</SelectItem>
              <SelectItem value="eur" disabled>EUR — Euro</SelectItem>
            </SelectContent>
          </Select>
          <Textarea placeholder="Notas" />
        </div>
      </Section>

      <Section title="Combobox · Autocomplete">
        <ComboboxDemo />
      </Section>

      <Section title="Checkbox · Radio · Switch">
        <Row>
          <Checkbox aria-label="off" /><Checkbox aria-label="on" defaultChecked /><Checkbox aria-label="ind" indeterminate />
          <Checkbox aria-label="disabled" disabled /><Checkbox aria-label="disabled on" disabled defaultChecked /><Checkbox aria-label="invalid" aria-invalid />
        </Row>
        <RadioGroup defaultValue="a" className="flex gap-4">
          <RadioGroupItem value="a" aria-label="A" /><RadioGroupItem value="b" aria-label="B" /><RadioGroupItem value="c" aria-label="C" disabled />
        </RadioGroup>
        <Row>
          <Switch aria-label="off" /><Switch aria-label="on" defaultChecked /><Switch aria-label="accent" variant="accent" defaultChecked />
          <Switch aria-label="sm" size="sm" defaultChecked /><Switch aria-label="disabled" disabled />
        </Row>
      </Section>

      <Section title="Chips (Toggle) · Badge">
        <Row><Toggle>Todos</Toggle><Toggle defaultPressed>Activos</Toggle><Toggle>Archivados</Toggle><Toggle disabled>Borradores</Toggle></Row>
        <Row>{BADGE_COLORS.map((color) => <Badge key={color} color={color}>{color}</Badge>)}</Row>
        <Row>{BADGE_COLORS.map((color) => <Badge key={color} color={color} dot size="sm">{color}</Badge>)}</Row>
        <Row><Badge variant="solid">Nuevo</Badge><Badge variant="solid" color="brand">Pro</Badge></Row>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Ingresos</CardTitle><CardDescription>Últimos 30 días</CardDescription><CardAction><Badge color="green" dot>+12%</Badge></CardAction></CardHeader>
            <CardContent><p className="text-heading-32 tabular-nums">$48.200</p></CardContent>
            <CardFooter><Button size="sm" variant="outline">Ver detalle</Button></CardFooter>
          </Card>
          <Card interactive tabIndex={0}><CardHeader><CardTitle>Interactiva</CardTitle><CardDescription>Hover, active y foco</CardDescription></CardHeader></Card>
          <Card selected><CardHeader><CardTitle>Seleccionada</CardTitle><CardDescription>Borde de marca</CardDescription></CardHeader></Card>
          <Card size="sm"><CardHeader><CardTitle>Chica</CardTitle><CardDescription>size=&quot;sm&quot;</CardDescription></CardHeader></Card>
          <Card variant="subtle"><CardHeader><CardTitle>Subtle</CardTitle><CardDescription>Zona hundida / vacío</CardDescription></CardHeader></Card>
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Estado</TableHead><TableHead numeric>Total</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell className="flex items-center gap-2 pt-3"><Avatar size="sm"><AvatarFallback>AP</AvatarFallback></Avatar>Ana Pérez</TableCell><TableCell><Badge color="green" dot>Pagado</Badge></TableCell><TableCell numeric>$1.200,00</TableCell></TableRow>
            <TableRow data-state="selected"><TableCell>Juan Gómez</TableCell><TableCell><Badge color="amber" dot>Pendiente</Badge></TableCell><TableCell numeric>$980,50</TableCell></TableRow>
            <TableRow tabIndex={0}><TableCell>Fila clickeable</TableCell><TableCell><Badge>Borrador</Badge></TableCell><TableCell numeric>$0,00</TableCell></TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section title="Tabs · Avatar · Skeleton · Separator">
        <Tabs defaultValue="resumen">
          <TabsList><TabsTrigger value="resumen">Resumen</TabsTrigger><TabsTrigger value="pagos">Pagos</TabsTrigger><TabsTrigger value="docs" disabled>Documentos</TabsTrigger></TabsList>
          <TabsContent value="resumen">Panel de resumen</TabsContent>
          <TabsContent value="pagos">Panel de pagos</TabsContent>
        </Tabs>
        <Row><Avatar size="sm"><AvatarFallback>AP</AvatarFallback></Avatar><Avatar><AvatarFallback>AP</AvatarFallback></Avatar><Avatar size="lg"><AvatarFallback>AP</AvatarFallback></Avatar></Row>
        <div className="flex max-w-sm flex-col gap-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="size-8 rounded-full" /></div>
        <Separator />
      </Section>

      <Section title="Alert">
        <div className="grid max-w-xl gap-3">
          {(["neutral", "brand", "success", "warning", "error"] as const).map((variant) => (
            <Alert key={variant} variant={variant}>
              {variant === "warning" || variant === "error" ? <TriangleAlertIcon /> : <InfoIcon />}
              <AlertTitle>Alert {variant}</AlertTitle>
              <AlertDescription>El fondo sigue neutro; solo cambian la franja y el ícono.</AlertDescription>
            </Alert>
          ))}
        </div>
      </Section>

      <Section title="Flotantes">
        <Row>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon-md" aria-label="Acciones" />}><MoreHorizontalIcon /></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Factura</DropdownMenuLabel>
                <DropdownMenuItem>Editar<DropdownMenuShortcut>E</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem>Duplicar</DropdownMenuItem>
                <DropdownMenuCheckboxItem defaultChecked>Visible para el cliente</DropdownMenuCheckboxItem>
                <DropdownMenuItem disabled>Archivar</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>Popover</PopoverTrigger>
            <PopoverContent><PopoverHeader><PopoverTitle>Filtros</PopoverTitle><PopoverDescription>Mostrá solo lo que importa.</PopoverDescription></PopoverHeader><Input size="sm" placeholder="Buscar" /></PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" />}>Tooltip</TooltipTrigger>
            <TooltipContent>Copiar al portapapeles</TooltipContent>
          </Tooltip>
          <Dialog>
            <DialogTrigger render={<Button />}>Dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nueva factura</DialogTitle><DialogDescription>Completá los datos básicos. Podés editarlos después.</DialogDescription></DialogHeader>
              <div className="grid gap-2"><Label htmlFor="dest">Concepto</Label><Input id="dest" placeholder="Servicio mensual" /></div>
              <DialogFooter><DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose><Button>Crear factura</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger render={<Button variant="secondary" />}>Sheet</SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Detalle</SheetTitle><SheetDescription>Panel lateral.</SheetDescription></SheetHeader>
              <SheetFooter><Button variant="accent">Guardar</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        </Row>
      </Section>
    </main>
  )
}
