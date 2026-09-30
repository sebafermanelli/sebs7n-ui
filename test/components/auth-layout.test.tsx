import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MailCheckIcon } from "lucide-react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

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
  authLabels,
} from "../../src/components/auth-layout"
import { Button } from "../../src/components/button"
import { Field, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { Input } from "../../src/components/input"
import { LabelsProvider } from "../../src/lib/labels"

function SignIn(props: { ambient?: boolean; autoFocus?: boolean; variant?: "card" | "plain"; error?: string; as?: "main" | "div" }) {
  return (
    <AuthLayout ambient={props.ambient} as={props.as} bar={<a href="/">Volver al inicio</a>}>
      <AuthHeader brand={<svg data-testid="marca" />}>
        <AuthTitle>Iniciar sesión</AuthTitle>
        <AuthDescription>Entrá para ver tus facturas.</AuthDescription>
      </AuthHeader>
      <AuthContent autoFocus={props.autoFocus} variant={props.variant}>
        <AuthProviders>
          <Button variant="secondary">Continuar con Google</Button>
        </AuthProviders>
        <AuthDivider />
        <Form>
          {props.error && <AuthError id="error-de-acceso">{props.error}</AuthError>}
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" />
            <FieldError />
          </Field>
          <Button type="submit">Iniciar sesión</Button>
        </Form>
      </AuthContent>
      <AuthFooter>
        <p>
          ¿No tenés cuenta? <a href="/registro">Registrate</a>
        </p>
      </AuthFooter>
    </AuthLayout>
  )
}

describe("AuthLayout", () => {
  it("una columna centrada de 400 con un solo h1, el main y el footer", () => {
    render(<SignIn />)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Iniciar sesión")
    const main = screen.getByRole("main")
    expect(main.querySelector("[data-slot=auth-column]")).toHaveClass("max-w-100", "w-full")
    // La barra de arriba (volver, tema) queda fuera del main: no es contenido de la página.
    expect(main).not.toContainElement(screen.getByRole("link", { name: "Volver al inicio" }))
    expect(document.querySelector("[data-slot=auth-footer]")).toContainElement(screen.getByRole("link", { name: "Registrate" }))
  })

  it("as=\"div\" cuando la app ya tiene su main", () => {
    render(<SignIn as="div" />)
    expect(screen.queryByRole("main")).toBeNull()
    expect(document.querySelector("[data-slot=auth-main]")?.tagName).toBe("DIV")
  })

  it("la marca va arriba del título y es decorativa", () => {
    render(<SignIn />)
    const marca = document.querySelector("[data-slot=auth-brand]")!
    expect(marca).toContainElement(screen.getByTestId("marca"))
    expect(marca.compareDocumentPosition(screen.getByRole("heading")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("AuthContent es una card por defecto y plain sin superficie", () => {
    const { unmount } = render(<SignIn />)
    const content = () => document.querySelector("[data-slot=auth-content]")!
    expect(content()).toHaveAttribute("data-variant", "card")
    expect(content()).toHaveClass("bg-surface", "shadow-widget", "rounded-surface")
    unmount()
    render(<SignIn variant="plain" />)
    expect(content()).toHaveAttribute("data-variant", "plain")
    expect(content()).not.toHaveClass("bg-surface")
  })

  it("ambient pinta el wallpaper y la card pasa a translúcida", () => {
    const { unmount } = render(<SignIn />)
    const root = () => document.querySelector("[data-slot=auth-layout]")!
    expect(root()).not.toHaveAttribute("data-ambient")
    expect(root()).toHaveClass("bg-background")
    unmount()
    render(<SignIn ambient />)
    expect(root()).toHaveAttribute("data-ambient", "")
    expect(root()).toHaveClass("bg-ambient")
    expect(document.querySelector("[data-slot=auth-content]")).toHaveClass("in-data-ambient:material-translucent-body")
  })

  it("AuthDivider dice «o», traducible por provider y por children", () => {
    const { unmount } = render(<AuthDivider />)
    expect(document.querySelector("[data-slot=auth-divider]")).toHaveTextContent(/^o$/)
    expect(authLabels.or).toBe("o")
    // Las líneas no se leen: solo el texto.
    expect(document.querySelectorAll("[data-slot=auth-divider] [aria-hidden=true]")).toHaveLength(2)
    unmount()
    const { unmount: u2 } = render(
      <LabelsProvider value={{ auth: { or: "or" } }}>
        <AuthDivider />
      </LabelsProvider>
    )
    expect(document.querySelector("[data-slot=auth-divider]")).toHaveTextContent(/^or$/)
    u2()
    render(<AuthDivider>o con tu email</AuthDivider>)
    expect(document.querySelector("[data-slot=auth-divider]")).toHaveTextContent(/^o con tu email$/)
  })

  it("AuthProviders apila los botones a todo el ancho", () => {
    render(<SignIn />)
    const providers = document.querySelector("[data-slot=auth-providers]")!
    expect(providers).toHaveClass("flex", "flex-col", "*:w-full")
  })

  it("autoFocus enfoca el primer campo, no el botón del proveedor", () => {
    render(<SignIn autoFocus />)
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus()
  })

  it("sin autoFocus no mueve el foco", () => {
    render(<SignIn />)
    expect(document.body).toHaveFocus()
  })

  it("AuthError: el error del formulario que no es de un campo, anunciado y enfocable", () => {
    render(<SignIn error="Email o contraseña incorrectos." />)
    const alerta = screen.getByRole("alert")
    expect(alerta).toHaveAttribute("data-slot", "auth-error")
    expect(alerta).toHaveAttribute("data-variant", "error")
    expect(alerta).toHaveAttribute("tabindex", "-1")
    expect(alerta).toHaveAttribute("id", "error-de-acceso")
    expect(alerta).toHaveTextContent("Email o contraseña incorrectos.")
  })

  it("se renderiza en el server (sin window)", () => {
    const html = renderToString(<SignIn autoFocus />)
    expect(html).toContain('data-slot="auth-layout"')
    expect(html).toContain("Iniciar sesión")
  })
})

describe("AuthStatus", () => {
  it("ícono, título h1, descripción y acción; se anuncia", async () => {
    const onClick = vi.fn()
    render(
      <AuthStatus
        icon={<MailCheckIcon />}
        title="Revisá tu email"
        description="Te mandamos un enlace para entrar."
        action={<Button onClick={onClick}>Volver a enviar</Button>}
      />
    )
    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("data-slot", "auth-status")
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Revisá tu email")
    expect(status.querySelector("[data-slot=auth-status-icon]")).toHaveAttribute("aria-hidden", "true")
    expect(status.querySelector("[data-slot=auth-status-icon]")).toHaveAttribute("data-tone", "brand")
    await userEvent.click(screen.getByRole("button", { name: "Volver a enviar" }))
    expect(onClick).toHaveBeenCalled()
  })

  it("titleAs y tone", () => {
    render(<AuthStatus icon={<MailCheckIcon />} title="Cuenta pendiente" titleAs="h2" tone="warning" />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Cuenta pendiente")
    expect(document.querySelector("[data-slot=auth-status-icon]")).toHaveAttribute("data-tone", "warning")
    expect(document.querySelector("[data-slot=auth-status-description]")).toBeNull()
  })
})
