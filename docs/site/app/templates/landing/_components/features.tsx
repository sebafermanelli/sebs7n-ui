import { BellIcon, ChartColumnIcon, DownloadIcon, ReceiptIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import { Card, CardDescription, CardGrid, CardHeader, CardTitle } from "sebs7n-ui/card"

import { FEATURES, type FeatureIcon } from "../_data/content"
import { SectionHeader } from "./section-header"

const ICONS: Record<FeatureIcon, React.ReactNode> = {
  receipt: <ReceiptIcon />,
  bell: <BellIcon />,
  chart: <ChartColumnIcon />,
  users: <UsersIcon />,
  download: <DownloadIcon />,
  shield: <ShieldCheckIcon />,
}

export function Features() {
  return (
    <section className="flex scroll-mt-20 flex-col gap-10" id="beneficios">
      <SectionHeader subtitle="Lo que hace falta para facturar y cobrar, sin lo que sobra." title="Todo en un lugar" />
      <CardGrid>
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader icon={ICONS[feature.icon]}>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </CardGrid>
    </section>
  )
}
