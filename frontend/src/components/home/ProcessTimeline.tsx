import { Reveal } from '@/components/ui/Primitives'
import { useSite } from '@/context/SiteContext'

export function ProcessTimeline() {
  const { settings } = useSite()
  const steps = settings?.process ?? []

  return (
    <section className="bg-mist/70 py-20 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="eyebrow">Our process</p>
          <span className="rule mt-4" />
          <h2 className="mt-5">
            From Vision
            <br />
            to Vibrant Places.
          </h2>
        </div>

        <Reveal>
          <ol className="grid gap-10 lg:grid-cols-5 lg:gap-6">
            {steps.map((step, index) => (
              <li key={step.step} className="relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-soft font-sans text-xs tracking-label text-gold-deep">
                    {step.step}
                  </span>
                  <span
                    aria-hidden
                    className={`h-px flex-1 bg-gold/40 ${index === steps.length - 1 ? 'lg:hidden' : ''}`}
                  />
                </div>
                <h3 className="mt-5 font-sans text-[0.72rem] uppercase tracking-label text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{step.copy}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
