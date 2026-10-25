import { ClosingCta } from '@/components/home/ClosingCta'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { Hero } from '@/components/home/Hero'
import { InsightsPreview } from '@/components/home/InsightsPreview'
import { Philosophy } from '@/components/home/Philosophy'
import { ProcessTimeline } from '@/components/home/ProcessTimeline'
import { ServicesBand } from '@/components/home/ServicesBand'
import { StatsBand } from '@/components/home/StatsBand'
import { usePageMeta } from '@/hooks/usePageMeta'

export function HomePage() {
  usePageMeta({
    title: 'UrbanLedge — People. Places. Possibility.',
    description:
      'UrbanLedge plans and develops residential and mixed-use places where architecture, community and long-term value come together.',
  })

  return (
    <>
      <Hero />
      <StatsBand />
      <FeaturedProjects />
      <Philosophy />
      <ProcessTimeline />
      <ServicesBand />
      <InsightsPreview />
      <ClosingCta />
    </>
  )
}
