import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "sebs7n-ui/accordion"

import { FAQ } from "../_data/content"
import { SectionHeader } from "./section-header"

export function Faq() {
  return (
    <section className="mx-auto flex w-full max-w-2xl scroll-mt-20 flex-col gap-10" id="preguntas">
      <SectionHeader title="Preguntas frecuentes" />
      <Accordion>
        {FAQ.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
