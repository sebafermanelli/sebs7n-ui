import { SectionHeader } from "./section-header"
import { TestimonialsCarousel } from "./testimonials-lazy"

// El carrusel (Embla, Rating, HoverCard) llega diferido; el servidor deja las primeras tarjetas y el lugar
// reservado. Los logos de arriba ya usan el `Marquee`: acá, algo que se puede leer con calma y con teclado.
export function Testimonials() {
  return (
    <section className="flex scroll-mt-20 flex-col gap-10" id="opiniones">
      <SectionHeader title="Lo que dicen quienes lo usan" />
      <TestimonialsCarousel />
    </section>
  )
}
