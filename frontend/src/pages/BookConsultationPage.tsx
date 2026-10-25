import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { IconCheck } from '@/components/icons'
import { PageHero } from '@/components/ui/PageHero'
import { useSite } from '@/context/SiteContext'
import { usePageMeta } from '@/hooks/usePageMeta'

const EXPECT = [
  'A 45-minute call with the people who would work on your project.',
  'An honest view of feasibility, programme and likely cost drivers.',
  'A short written follow-up with the points we discussed.',
]

export function BookConsultationPage() {
  const { settings } = useSite()
  const contact = settings?.contact
  const timezone = settings?.locale.timezone

  usePageMeta({
    title: 'Book a consultation',
    description:
      'Request a consultation with the UrbanLedge team about a site, a development brief or a property.',
  })

  return (
    <>
      <PageHero
        eyebrow="Book a consultation"
        title={
          <>
            Bring Us
            <br />
            Your Brief.
          </>
        }
        copy="Tell us about the site, the brief or the property and we will arrange a call with the right people."
        compact
      />

      <section className="bg-soft py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-20">
          <div className="border border-hairline bg-white p-6 sm:p-10">
            <ConsultationForm />
          </div>

          <aside>
            <p className="eyebrow">What to expect</p>
            <span className="rule mt-4" />
            <ul className="mt-8 space-y-5">
              {EXPECT.map((item) => (
                <li key={item} className="flex gap-4 text-sm leading-relaxed text-ink/80">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-hairline pt-8">
              <p className="eyebrow">Good to know</p>
              <p className="mt-5 text-sm text-ink/70">
                Preferred times are requests only — the team confirms the final slot with you
                directly.
                {timezone ? ` The studio works to ${timezone.replace('_', ' ')}.` : ''}
              </p>
              {contact && (
                <p className="mt-5 text-sm text-ink/70">
                  Prefer email? Write to{' '}
                  <a href={`mailto:${contact.email}`} className="text-gold-deep underline">
                    {contact.email}
                  </a>
                  .
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
