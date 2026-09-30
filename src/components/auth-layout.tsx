import type * as React from "react"
import { CircleAlertIcon } from "lucide-react"

import { AuthDividerText, FocusFirstField } from "../internal/auth-client.js"
import type { Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { cardVariants } from "../variants/card.js"
import { Alert, AlertDescription, AlertTitle } from "./alert.js"

/**
 * La pantalla de entrar, registrarse, recuperar la clave o esperar una aprobación, con la forma
 * del inicio de sesión de iCloud: una columna de 400 centrada, la marca arriba, el título grande y
 * una línea que explica, el formulario en una card y, debajo, los links y el texto legal.
 *
 * ```tsx
 * <AuthLayout bar={<VolverAlInicio />}>
 *   <AuthHeader brand={<Logo />}>
 *     <AuthTitle>Iniciar sesión</AuthTitle>
 *     <AuthDescription>Entrá para ver tus facturas.</AuthDescription>
 *   </AuthHeader>
 *   <AuthContent autoFocus>
 *     <AuthProviders><Button variant="secondary">Continuar con Google</Button></AuthProviders>
 *     <AuthDivider />
 *     <Form errors={errors}>…</Form>
 *   </AuthContent>
 *   <AuthFooter>¿No tenés cuenta? <a href="/registro">Registrate</a></AuthFooter>
 * </AuthLayout>
 * ```
 *
 * El título va **afuera** de la card: es el `<h1>` de la página y se lee igual con `variant="plain"`.
 * Sin estado propio: sirve en un Server Component (el texto del separador y el foco inicial van en
 * dos piezas de cliente, en `internal/`).
 */
type AuthLayoutProps = React.ComponentProps<"div"> & {
  /**
   * El wallpaper de la home de iCloud detrás (`bg-ambient`), con la card en el material
   * translúcido; los campos siguen opacos. Liso por defecto, como una app por dentro.
   */
  ambient?: boolean
  /** La barra de arriba, fuera del `main`: «Volver al inicio» a la izquierda, el tema a la derecha. */
  bar?: React.ReactNode
  /** `main` por defecto; `div` si el layout de la app ya pone su `<main>`. */
  as?: "main" | "div"
  /** El `id` del `main`, para el «Ir al contenido» de la app. */
  mainId?: string
}

function AuthLayout({ className, ambient = false, bar, as: Main = "main", mainId, children, ...props }: AuthLayoutProps) {
  return (
    <div
      data-slot="auth-layout"
      data-ambient={ambient ? "" : undefined}
      className={cn("flex min-h-dvh flex-col bg-background text-label", ambient && "bg-ambient", className)}
      {...props}
    >
      {bar != null && (
        <div data-slot="auth-bar" className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
          {bar}
        </div>
      )}
      {/* Arriba en el teléfono (el teclado tapa la mitad de abajo y un centrado salta al abrirlo);
          centrada en alto desde `sm`, como la de iCloud. */}
      <Main
        data-slot="auth-main"
        id={mainId}
        className="flex flex-1 flex-col items-center px-4 pt-8 pb-16 sm:justify-center sm:py-12"
      >
        <div data-slot="auth-column" className="flex w-full max-w-100 flex-col gap-6">
          {children}
        </div>
      </Main>
    </div>
  )
}

type AuthHeaderProps = React.ComponentProps<"div"> & {
  /**
   * La marca de la app, arriba del título: un logo o un ícono de 48. Es decorativa (el título ya
   * dice dónde se está). Si es un link al inicio, pasalo con su nombre: `<a aria-label="Inicio">`.
   */
  brand?: React.ReactNode
}

function AuthHeader({ className, brand, children, ...props }: AuthHeaderProps) {
  return (
    <div data-slot="auth-header" className={cn("flex flex-col items-center gap-4 text-center", className)} {...props}>
      {brand != null && (
        <div data-slot="auth-brand" className="flex min-h-12 items-center justify-center [&>svg]:size-12 [&>img]:h-12 [&>img]:w-auto">
          {brand}
        </div>
      )}
      <div className="flex flex-col gap-1.5 empty:hidden">{children}</div>
    </div>
  )
}

/** El `<h1>` de la pantalla. Uno solo: con `AuthStatus` en lugar del formulario, el título es el suyo. */
function AuthTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 data-slot="auth-title" className={cn("text-title-1 text-balance text-label", className)} {...props} />
}

function AuthDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="auth-description" className={cn("text-callout text-pretty text-label-secondary", className)} {...props} />
}

type AuthContentProps = React.ComponentProps<"div"> & {
  /**
   * `card` (default): la card de iCloud, que sobre el wallpaper pasa al material translúcido.
   * `plain`: sin superficie, para una pantalla que ya es una hoja o para un panel adentro de otra
   * card (el de entrar en medio de una compra).
   */
  variant?: "card" | "plain"
  /**
   * Enfoca el primer campo al montar (no el botón del proveedor). Para la pantalla que es solo
   * eso —entrar—; en un panel dentro de otra página, no: le saca el lugar al lector de pantalla.
   */
  autoFocus?: boolean
}

function AuthContent({ className, variant = "card", autoFocus = false, children, ...props }: AuthContentProps) {
  return (
    <div
      data-slot="auth-content"
      data-variant={variant}
      className={cn(
        "flex flex-col gap-5",
        // 24 en el teléfono (la card entra en 358 con 310 para el campo); 32 desde `sm`.
        variant === "card" && [cardVariants(), "p-6 sm:p-8"],
        className
      )}
      {...props}
    >
      {autoFocus && <FocusFirstField />}
      {children}
    </div>
  )
}

/** Los botones de «Continuar con…», uno abajo del otro y a todo el ancho. Van `secondary`: el acento es del envío. */
function AuthProviders({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="auth-providers" className={cn("flex flex-col gap-3 *:w-full", className)} {...props} />
}

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const authLabels: NonNullable<Labels["auth"]> = { or: "o" }

type AuthDividerProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** El texto del medio. Por defecto `labels.auth.or` («o»). */
  children?: React.ReactNode
  labels?: Partial<NonNullable<Labels["auth"]>>
}

/**
 * La línea con «o» entre los proveedores y el formulario. Las líneas no se leen; el texto sí, para
 * que el lector sepa que lo que sigue es otra forma de entrar.
 */
function AuthDivider({ className, children, labels, ...props }: AuthDividerProps) {
  return (
    <div data-slot="auth-divider" className={cn("flex items-center gap-3 text-footnote text-label-secondary", className)} {...props}>
      <span aria-hidden="true" className="h-px flex-1 bg-separator" />
      <span>{children ?? <AuthDividerText defaults={authLabels} labels={labels} />}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-separator" />
    </div>
  )
}

type AuthErrorProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Una línea en negrita arriba del mensaje. Opcional: casi siempre alcanza con el mensaje. */
  title?: React.ReactNode
}

/**
 * El error del formulario que no es de un campo: «Email o contraseña incorrectos», «Demasiados
 * intentos». Los de un campo van en su `FieldError` (el `errors` de `Form`), que ya enfoca el primero.
 * Va arriba de los campos, se anuncia al aparecer (`role="alert"`) y se puede enfocar (`tabIndex -1`)
 * si la app quiere llevar el foco ahí; con un `id`, el botón de enviar puede describirse con él.
 */
function AuthError({ className, title, children, ...props }: AuthErrorProps) {
  return (
    <Alert data-slot="auth-error" data-variant="error" variant="error" tabIndex={-1} className={cn("outline-none focus-visible:focus-ring", className)} {...props}>
      <CircleAlertIcon aria-hidden="true" />
      {title != null && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className={cn(title == null && "text-label")}>{children}</AlertDescription>
    </Alert>
  )
}

/** Solo el color del ícono: el fondo es el gris de siempre, y el 900 llega a 3:1 como en `Alert`. */
const TONE = {
  neutral: "text-label-secondary",
  brand: "text-brand-900",
  success: "text-green-900",
  warning: "text-amber-900",
  error: "text-red-900",
} as const

type AuthStatusProps = Omit<React.ComponentProps<"div">, "title"> & {
  icon?: React.ReactNode
  title: React.ReactNode
  /** h1 por defecto: reemplaza al título de la pantalla («Revisá tu email»). h2 si hay un `AuthTitle` arriba. */
  titleAs?: "h1" | "h2" | "h3"
  description?: React.ReactNode
  /** El botón o link para seguir: «Volver a enviar», «Ir al inicio». Varios, uno abajo del otro. */
  action?: React.ReactNode
  /** El color del ícono. `brand` por defecto. */
  tone?: keyof typeof TONE
}

/**
 * Lo que queda en lugar del formulario después de enviarlo: «Revisá tu email», «Tu cuenta espera
 * la aprobación». Ícono, título, explicación y la acción que sigue. Es `role="status"`: si aparece
 * en lugar del formulario sin cambiar de página, se anuncia sin cortar lo que se esté leyendo.
 * Va adentro de `AuthContent` (la card), con la marca sola arriba en `AuthHeader`.
 */
function AuthStatus({ className, icon, title, titleAs: Title = "h1", description, action, tone = "brand", children, ...props }: AuthStatusProps) {
  return (
    <div role="status" data-slot="auth-status" className={cn("flex flex-col items-center gap-4 text-center", className)} {...props}>
      {icon != null && (
        <div
          data-slot="auth-status-icon"
          data-tone={tone}
          aria-hidden="true"
          className={cn("flex size-12 items-center justify-center rounded-full bg-fill-1 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6", TONE[tone])}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Title data-slot="auth-status-title" className="text-title-2 text-balance text-label">
          {title}
        </Title>
        {description != null && (
          <p data-slot="auth-status-description" className="text-callout text-pretty text-label-secondary">
            {description}
          </p>
        )}
      </div>
      {children}
      {action != null && (
        <div data-slot="auth-status-action" className="flex w-full flex-col gap-3 *:w-full">
          {action}
        </div>
      )}
    </div>
  )
}

/**
 * Debajo de la card: «¿No tenés cuenta? Registrate», «Volver a iniciar sesión» y el texto legal
 * (en un `<p className="text-footnote">`, o un `<nav aria-label="Legales">` si son varios links).
 * Los links, con `linkVariants` (`inline` o `subtle`).
 */
function AuthFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="auth-footer"
      className={cn("flex flex-col items-center gap-3 text-center text-callout text-pretty text-label-secondary", className)}
      {...props}
    />
  )
}

export {
  AuthContent,
  AuthDescription,
  AuthDivider,
  AuthError,
  AuthFooter,
  AuthHeader,
  AuthLayout,
  AuthProviders,
  AuthStatus,
  AuthTitle,
  authLabels,
  type AuthContentProps,
  type AuthDividerProps,
  type AuthErrorProps,
  type AuthHeaderProps,
  type AuthLayoutProps,
  type AuthStatusProps,
}
