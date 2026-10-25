import { PageHero } from '@/components/ui/PageHero'
import { useSite } from '@/context/SiteContext'
import { usePageMeta } from '@/hooks/usePageMeta'

interface Block {
  heading: string
  paragraphs: string[]
}

const PRIVACY: Block[] = [
  {
    heading: 'What this document is',
    paragraphs: [
      'This is a template privacy policy for a demonstration website. It describes how this deployment handles the information you submit, and it must be reviewed by qualified counsel and adapted before the site is used commercially.',
      'The site stores submissions in its own database in this environment. No analytics, advertising or third-party tracking scripts are loaded.',
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: [
      'When you send an enquiry, request a consultation or subscribe to the newsletter we store the name, email address, telephone number, company, enquiry type and message you provide, together with the property or project the enquiry refers to and the time it was received.',
      'When you create an account we store your name, email address and a password hash. Passwords themselves are never stored in readable form.',
      'Session tokens are kept in your browser’s local storage so that you stay signed in. They contain no personal data beyond the account identifier.',
    ],
  },
  {
    heading: 'How we use it',
    paragraphs: [
      'Enquiries and consultation requests are used only to respond to you and to keep an internal record of the conversation. Account details are used to give you access to your shortlist and your past requests.',
      'We do not sell or rent personal information. We do not use it to train external models or to build advertising profiles.',
    ],
  },
  {
    heading: 'Retention and your choices',
    paragraphs: [
      'Records are kept while they are useful for the conversation and then deleted on request. You can ask us to correct or remove your details at any time using the contact address on this site.',
      'You can remove your shortlist entries from your account at any time. Newsletter messages include an unsubscribe route.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about this policy, or requests about your own information, should go to the contact address shown on the contact page.',
    ],
  },
]

const TERMS: Block[] = [
  {
    heading: 'About these terms',
    paragraphs: [
      'This is a template terms of use document for a demonstration website. It must be reviewed by qualified counsel and adapted before the site is used commercially.',
    ],
  },
  {
    heading: 'Demonstration content',
    paragraphs: [
      'Projects, listings, articles, statistics, publications and imagery on this site are illustrative placeholders created for layout purposes. They do not describe real developments, real availability or verified company results, and nothing on this site is an offer, an invitation to treat or a representation of fact.',
      'Property prices, areas and availability may change and are shown for demonstration only.',
    ],
  },
  {
    heading: 'No professional advice',
    paragraphs: [
      'Nothing on this site is architectural, planning, legal, tax or investment advice. Decisions about a site, a purchase or a development should be taken with your own advisers.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: [
      'You agree not to submit unlawful, misleading or abusive material through the forms on this site, not to attempt to access accounts or data that are not yours, and not to interfere with the availability of the service.',
    ],
  },
  {
    heading: 'Liability',
    paragraphs: [
      'This site is provided as a demonstration without warranties of any kind. To the extent permitted by law, the operator is not liable for any loss arising from reliance on its content.',
    ],
  },
]

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { settings } = useSite()
  const blocks = kind === 'privacy' ? PRIVACY : TERMS
  const title = kind === 'privacy' ? 'Privacy policy' : 'Terms of use'

  usePageMeta({ title, description: `${title} for the UrbanLedge website.` })

  return (
    <>
      <PageHero
        eyebrow={title}
        title={kind === 'privacy' ? 'How We Handle Your Information.' : 'The Ground Rules.'}
        copy={`Last reviewed ${new Date().getFullYear()}. ${settings?.brand.disclosure ?? ''}`.trim()}
        compact
      />

      <section className="bg-soft py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:gap-20">
          <div className="max-w-3xl">
            <p className="border-l border-gold/60 pl-6 text-sm text-ink/75">
              Template document for a demonstration deployment. Have it reviewed before launch.
            </p>
            <div className="mt-12 space-y-12">
              {blocks.map((block) => (
                <section key={block.heading}>
                  <h2 className="text-2xl">{block.heading}</h2>
                  <div className="prose-editorial mt-5">
                    {block.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow">On this page</p>
            <span className="rule mt-4" />
            <ol className="mt-6 space-y-3 text-sm text-ink/70">
              {blocks.map((block, index) => (
                <li key={block.heading} className="flex gap-3">
                  <span className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{block.heading}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </>
  )
}
