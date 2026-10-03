"use client"

import { ReceiptTextIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useReducer } from "react"
import { AuthContent, AuthDescription, AuthError, AuthFooter, AuthHeader, AuthLayout, AuthTitle } from "sebs7n-ui/auth-layout"
import { Button } from "sebs7n-ui/button"
import { Checkbox } from "sebs7n-ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { OTPField } from "sebs7n-ui/otp-field"
import { PasswordInput } from "sebs7n-ui/password-input"
import { TextLink } from "sebs7n-ui/text-link"

import { DEMO_CODE, DEMO_PASSWORD, INITIAL_LOGIN, loginReducer } from "../_lib/login"
import { DASHBOARD_PATH, GALLERY_PATH } from "../_lib/routes"

// La marca de ejemplo: un ícono de 48 en el color de la marca, como el ícono de una app.
function Brand() {
  return (
    <span className="flex size-12 items-center justify-center rounded-panel bg-brand-700 text-white">
      <ReceiptTextIcon className="size-6" />
    </span>
  )
}

// La pantalla de entrar, fuera del `AppShell` (el layout la deja pasar sola). Dos pasos: correo y
// contraseña, y el código de la app de autenticación. Es una demo: no hay servidor, así que los datos
// correctos están escritos abajo.
export default function LoginPage() {
  const [state, dispatch] = useReducer(loginReducer, INITIAL_LOGIN)
  const router = useRouter()

  return (
    <AuthLayout
      bar={
        GALLERY_PATH ? (
          <TextLink href={GALLERY_PATH} trailing="chevron">
            Volver a Templates
          </TextLink>
        ) : undefined
      }
    >
      {state.step === "credentials" && (
        <>
          <AuthHeader brand={<Brand />}>
            <AuthTitle>Iniciar sesión</AuthTitle>
            <AuthDescription>Entrá a Acme Facturación para ver tus cobros.</AuthDescription>
          </AuthHeader>
          <AuthContent autoFocus>
            <Form className="gap-4" onFormSubmit={(values) => dispatch({ type: "credentials", email: String(values.email), password: String(values.password) })}>
              {state.error && <AuthError>{state.error}</AuthError>}
              <Field name="email">
                <FieldLabel>Correo</FieldLabel>
                <Input autoComplete="username" required size="lg" type="email" />
                <FieldError match="valueMissing">Falta el correo</FieldError>
                <FieldError match="typeMismatch">Escribí un correo válido</FieldError>
              </Field>
              <Field name="password">
                <FieldLabel>Contraseña</FieldLabel>
                <PasswordInput autoComplete="current-password" required size="lg" />
                <FieldError match="valueMissing">Falta la contraseña</FieldError>
              </Field>
              <Field name="remember">
                <div className="flex items-center gap-3">
                  <Checkbox defaultChecked />
                  <FieldLabel>Recordarme en este equipo</FieldLabel>
                </div>
              </Field>
              <Button className="w-full" size="lg" type="submit">
                Continuar
              </Button>
            </Form>
          </AuthContent>
          <AuthFooter>
            <p>
              Es una demo: probá con cualquier correo y la contraseña <code>{DEMO_PASSWORD}</code>.
            </p>
          </AuthFooter>
        </>
      )}

      {state.step === "code" && (
        <>
          <AuthHeader brand={<Brand />}>
            <AuthTitle>Verificá que sos vos</AuthTitle>
            <AuthDescription>{`Ingresá el código de seis dígitos de tu app de autenticación para ${state.email}.`}</AuthDescription>
          </AuthHeader>
          <AuthContent autoFocus>
            <Form className="gap-4" onFormSubmit={(values) => dispatch({ type: "code", code: String(values.code) })}>
              {state.error && <AuthError>{state.error}</AuthError>}
              <Field name="code" validate={(value) => (String(value).length === 6 ? null : "El código tiene seis dígitos.")}>
                <FieldLabel required>Código de verificación</FieldLabel>
                <OTPField size="lg" />
                <FieldDescription>
                  En la demo es <code>{DEMO_CODE}</code>.
                </FieldDescription>
                <FieldError />
              </Field>
              <Button className="w-full" size="lg" type="submit">
                Verificar
              </Button>
              <Button className="w-full" onClick={() => dispatch({ type: "back" })} type="button" variant="plain">
                Usar otra cuenta
              </Button>
            </Form>
          </AuthContent>
        </>
      )}

      {state.step === "done" && (
        <>
          <AuthHeader brand={<Brand />}>
            <AuthTitle>Listo, ya estás adentro</AuthTitle>
            <AuthDescription>{`Entraste como ${state.email}.`}</AuthDescription>
          </AuthHeader>
          <AuthContent>
            <Button className="w-full" onClick={() => router.push(DASHBOARD_PATH)} size="lg">
              Ir al panel
            </Button>
          </AuthContent>
        </>
      )}
    </AuthLayout>
  )
}
