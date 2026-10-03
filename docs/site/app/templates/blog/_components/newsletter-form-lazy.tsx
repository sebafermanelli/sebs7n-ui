"use client"

import dynamic from "next/dynamic"

// Una caja del alto del formulario (una fila en escritorio; campo y botón apilados en el teléfono) hasta que llega.
const Form = dynamic(() => import("./newsletter-form"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-9 max-sm:h-[80px]" />,
})

export function NewsletterForm() {
  return <Form />
}
