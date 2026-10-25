import { FaqList } from '@/components/FaqList'
import { InquiryForm } from '@/components/forms/InquiryForm'
import { PageHero } from '@/components/ui/PageHero'
import { useSite } from '@/context/SiteContext'
import { usePageMeta } from '@/hooks/usePageMeta'

export function ContactPage() {
  const { settings } = useSite()
  const contact = settings?.contact
  const social = settings?.social ?? {}

  usePageMeta({
    title: 'Contact',
    description:
      'Contact the UrbanLedge team about a listing, a project or a site you are considering developing.',
  })

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk To
            <br />
            The Team.
          </>
        }
        copy="Whether you are buying, developing or simply testing an idea, a short message is the fastest way in."
        compact
      />

      <section className="bg-soft py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div className="border border-hairline bg-white p-6 sm:p-10">
            <InquiryForm
              source="contact"
              heading="Send us a message"
              intro="We read every enquiry and reply within one business day."
              submitLabel="Send message"
            />
          </div>

          <div>
            <p className="eyebrow">Direct lines</p>
            <span className="rule mt-4" />
            <dl className="mt-8 space-y-8">
              {contact && (
                <>
                  <div>
                    <dt className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Email</dt>
                    <dd className="mt-2">
                      <a href={`mailto:${contact.email}`} className="text-ink underline-offset-4 hover:text-gold-deep hover:underline">
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Telephone</dt>
                    <dd className="mt-2">
                      <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-ink hover:text-gold-deep">
                        {contact.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Studio</dt>
                    <dd className="mt-2 text-sm text-ink/80">
                      {contact.address}
                      {contact.hours && <span className="mt-2 block text-warmgray">{contact.hours}</span>}
                    </dd>
                  </div>
                </>
              )}
            </dl>

            {Object.keys(social).length > 0 && (
              <div className="mt-10 border-t border-hairline pt-8">
                <p className="eyebrow">Follow</p>
                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3 font-sans text-[0.68rem] uppercase tracking-label">
                  {Object.entries(social).map(([name, href]) => (
                    <li key={name}>
                      <a href={href} className="text-ink/75 hover:text-gold-deep" rel="noreferrer">
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-10 text-xs text-warmgray">
              {contact?.map_note ?? 'A map appears once a verified address is configured.'}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="eyebrow">Questions</p>
            <span className="rule mt-4" />
            <h2 className="mt-5">Before You Write.</h2>
            <p className="mt-6 max-w-prose text-sm text-ink/70">
              The answers people ask for most often. Anything else, send us a note.
            </p>
          </div>
          <FaqList limit={6} />
        </div>
      </section>
    </>
  )
}
