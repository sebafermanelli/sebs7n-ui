import { NewsletterForm } from "./newsletter-form-lazy"

// El cierre de la portada, en una línea: una frase y el campo con su botón. El formulario (Form, Field,
// Input, Button, toast) llega diferido; el texto es del servidor.
export function Newsletter() {
  return (
    <section aria-labelledby="suscribirse-titulo" className="flex scroll-mt-20 flex-col gap-3 border-t border-separator pt-10" id="suscribirse">
      <h2 className="text-title-3 text-label" id="suscribirse-titulo">
        Una nota por mes, nada más
      </h2>
      <NewsletterForm />
    </section>
  )
}
