"use client"

import { ArrowLeftIcon, ClockIcon, MailCheckIcon, ReceiptTextIcon } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "sebs7n-ui/alert"
import {
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
} from "sebs7n-ui/auth-layout"
import { Button } from "sebs7n-ui/button"
import { Checkbox } from "sebs7n-ui/checkbox"
import { Field, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { PasswordInput } from "sebs7n-ui/password-input"
import { buttonVariants } from "sebs7n-ui/variants/button"
import { linkVariants } from "sebs7n-ui/variants/link"

// La marca de ejemplo: un ícono de 48 en el color de la marca, como el ícono de una app.
function Brand() {
  return (
    <span className="flex size-12 items-center justify-center rounded-panel bg-brand-700 text-white">
      <ReceiptTextIcon className="size-6" />
    </span>
  )
}

// La pantalla ocupa la ventana; en la demo, una caja. `as="div"` porque el sitio ya tiene su `<main>`,
// y `[contain:paint]` para que el wallpaper (fijo a la ventana) quede adentro.
const BOX = "min-h-0 w-full overflow-hidden rounded-surface border border-separator [contain:paint]"

const link = linkVariants({ variant: "inline" })

/**
 * Iniciar sesión, sobre el wallpaper
 * La columna de 400: la marca, el `<h1>` y una línea arriba, el formulario en la card y los links abajo. Con `ambient` la card pasa al material translúcido; los campos siguen opacos. Probá entrar con cualquier contraseña: el error que no es de un campo va en `AuthError`, arriba.
 */
export function SignIn() {
  const [error, setError] = useState(false)
  return (
    <AuthLayout ambient as="div" className={BOX}>
      <AuthHeader brand={<Brand />}>
        <AuthTitle>Iniciar sesión</AuthTitle>
        <AuthDescription>Entrá para ver tus facturas y cobros.</AuthDescription>
      </AuthHeader>
      <AuthContent>
        <Form className="gap-4" onFormSubmit={() => setError(true)}>
          {error && <AuthError>Email o contraseña incorrectos.</AuthError>}
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input autoComplete="username" required type="email" />
            <FieldError match="valueMissing">Falta el email</FieldError>
          </Field>
          <Field name="password">
            <div className="flex items-center justify-between">
              <FieldLabel>Contraseña</FieldLabel>
              <a className={linkVariants({ variant: "subtle" })} href="#ejemplos">
                ¿La olvidaste?
              </a>
            </div>
            <PasswordInput autoComplete="current-password" required />
            <FieldError match="valueMissing">Falta la contraseña</FieldError>
          </Field>
          <Button className="w-full" type="submit">
            Iniciar sesión
          </Button>
        </Form>
      </AuthContent>
      <AuthFooter>
        <p>
          ¿No tenés cuenta?{" "}
          <a className={link} href="#ejemplos">
            Registrate
          </a>
        </p>
      </AuthFooter>
    </AuthLayout>
  )
}

/**
 * Crear una cuenta
 * Un aviso que sigue siendo verdad en un `Alert`, arriba de todo; el proveedor (`secondary`: el acento es del envío) con el «o» en el medio, y los términos en una casilla obligatoria de verdad: al enviar sin tildar, `Form` lleva el foco ahí y dice por qué. La barra de arriba (`bar`) queda fuera del `main`.
 */
export function SignUp() {
  return (
    <AuthLayout
      as="div"
      bar={
        <a className={buttonVariants({ variant: "plain", size: "sm" })} href="#ejemplos">
          <ArrowLeftIcon />
          Volver al inicio
        </a>
      }
      className={BOX}
    >
      <AuthHeader brand={<Brand />}>
        <AuthTitle>Crear una cuenta</AuthTitle>
        <AuthDescription>Facturá y cobrá desde un solo lugar.</AuthDescription>
      </AuthHeader>
      <AuthContent>
        <Alert>
          <AlertDescription>Un administrador de tu estudio aprueba las cuentas nuevas antes del primer ingreso.</AlertDescription>
        </Alert>
        <AuthProviders>
          <Button type="button" variant="secondary">
            Continuar con Google
          </Button>
        </AuthProviders>
        <AuthDivider />
        <Form className="gap-4">
          <Field name="name">
            <FieldLabel>Nombre y apellido</FieldLabel>
            <Input autoComplete="name" required />
            <FieldError match="valueMissing">Falta tu nombre</FieldError>
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input autoComplete="email" required type="email" />
            <FieldError match="valueMissing">Falta el email</FieldError>
          </Field>
          <Field name="password">
            <FieldLabel>Contraseña</FieldLabel>
            <PasswordInput autoComplete="new-password" minLength={8} required strength />
            <FieldError match="valueMissing">Falta la contraseña</FieldError>
            <FieldError match="tooShort">Tiene que tener 8 caracteres o más</FieldError>
          </Field>
          <Field name="terms">
            <div className="flex items-start gap-3">
              <Checkbox required />
              <FieldLabel>
                <span>
                  Acepto los{" "}
                  <a className={link} href="#ejemplos">
                    términos
                  </a>{" "}
                  y la{" "}
                  <a className={link} href="#ejemplos">
                    política de privacidad
                  </a>
                </span>
              </FieldLabel>
            </div>
            <FieldError match="valueMissing">Para seguir, aceptá los términos</FieldError>
          </Field>
          <Button className="w-full" type="submit">
            Crear cuenta
          </Button>
        </Form>
      </AuthContent>
      <AuthFooter>
        <p>
          ¿Ya tenés cuenta?{" "}
          <a className={link} href="#ejemplos">
            Iniciá sesión
          </a>
        </p>
        <p className="text-footnote">Al continuar con Google aceptás los mismos términos.</p>
      </AuthFooter>
    </AuthLayout>
  )
}

/**
 * Recuperar la contraseña
 * Un campo y el envío. Al mandarlo, `AuthStatus` queda en lugar del formulario, con su propio `<h1>` y `role="status"`: se anuncia sin cambiar de página.
 */
export function Recover() {
  const [sent, setSent] = useState<string | null>(null)
  return (
    <AuthLayout as="div" className={BOX}>
      {sent ? (
        <>
          <AuthHeader brand={<Brand />} />
          <AuthContent>
            <AuthStatus
              action={
                <Button onClick={() => setSent(null)} variant="secondary">
                  Usar otro email
                </Button>
              }
              description={`Si ${sent} tiene una cuenta, te llega un enlace para elegir una contraseña nueva. Vence en una hora.`}
              icon={<MailCheckIcon />}
              title="Revisá tu email"
            />
          </AuthContent>
        </>
      ) : (
        <>
          <AuthHeader brand={<Brand />}>
            <AuthTitle>Recuperar la contraseña</AuthTitle>
            <AuthDescription>Te mandamos un enlace para elegir una nueva.</AuthDescription>
          </AuthHeader>
          <AuthContent>
            <Form className="gap-4" onFormSubmit={(values) => setSent(String(values.email))}>
              <Field name="email">
                <FieldLabel>Email</FieldLabel>
                <Input autoComplete="email" required type="email" />
                <FieldError match="valueMissing">Falta el email</FieldError>
              </Field>
              <Button className="w-full" type="submit">
                Enviar enlace
              </Button>
            </Form>
          </AuthContent>
        </>
      )}
      <AuthFooter>
        <a className={linkVariants({ variant: "subtle" })} href="#ejemplos">
          Volver a iniciar sesión
        </a>
      </AuthFooter>
    </AuthLayout>
  )
}

/**
 * Cuenta pendiente de aprobación
 * La cuenta existe pero todavía no entra: `AuthStatus` con `tone="warning"`, qué pasa y con quién hablar. La acción que sigue va a todo el ancho; salir, abajo.
 */
export function Pending() {
  return (
    <AuthLayout as="div" className={BOX}>
      <AuthHeader brand={<Brand />} />
      <AuthContent>
        <AuthStatus
          action={
            <a className={buttonVariants({ variant: "secondary" })} href="#ejemplos">
              Escribirle al administrador
            </a>
          }
          description="Un administrador de tu estudio revisa las cuentas nuevas. Te avisamos por email cuando puedas entrar."
          icon={<ClockIcon />}
          title="Tu cuenta espera la aprobación"
          tone="warning"
        />
      </AuthContent>
      <AuthFooter>
        <button className={linkVariants({ variant: "subtle" })} type="button">
          Cerrar sesión
        </button>
      </AuthFooter>
    </AuthLayout>
  )
}
