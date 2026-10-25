import { useEffect, useState, type FormEvent } from 'react'

import { ConsentField, SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { ErrorNote, SuccessNote } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { useInquiryTypes } from '@/context/SiteContext'
import { ApiError, api } from '@/lib/api'
import type { Submission } from '@/lib/types'

interface InquiryFormProps {
  source: 'contact' | 'property' | 'project' | 'viewing' | 'services'
  propertyId?: number
  projectId?: number
  heading?: string
  intro?: string
  submitLabel?: string
  defaultInquiryType?: string
  defaultMessage?: string
  messageLabel?: string
  compact?: boolean
}

const FALLBACK_TYPES = ['General inquiry', 'Sales enquiry', 'Viewing request', 'Partnership']

/**
 * The public enquiry form. Used on the contact page and on every detail page;
 * the property or project it belongs to is resolved server-side from its id.
 */
export function InquiryForm({
  source,
  propertyId,
  projectId,
  heading = 'Request a call back',
  intro = 'Tell us what you are looking for and the team will respond within one business day.',
  submitLabel = 'Send enquiry',
  defaultInquiryType,
  defaultMessage = '',
  messageLabel = 'How can we help?',
  compact,
}: InquiryFormProps) {
  const { user } = useAuth()
  const inquiryTypes = useInquiryTypes()
  const options = (inquiryTypes.length ? inquiryTypes : FALLBACK_TYPES).map((value) => ({
    value,
    label: value,
  }))

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiry_type: defaultInquiryType ?? options[0]?.value ?? 'General inquiry',
    message: defaultMessage,
  })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [failure, setFailure] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState('')

  // Prefill from the signed-in account without overwriting anything typed.
  useEffect(() => {
    if (!user) return
    setValues((prev) => ({
      ...prev,
      name: prev.name || user.name,
      email: prev.email || user.email,
      phone: prev.phone || (user.phone ?? ''),
      company: prev.company || (user.company ?? ''),
    }))
  }, [user])

  useEffect(() => {
    if (inquiryTypes.length === 0) return
    setValues((prev) =>
      inquiryTypes.includes(prev.inquiry_type) ? prev : { ...prev, inquiry_type: inquiryTypes[0] },
    )
  }, [inquiryTypes])

  function update(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setState('sending')
    setFailure(null)
    setErrors({})

    try {
      const result = await api.post<Submission>('/inquiries', {
        ...values,
        phone: values.phone || null,
        company: values.company || null,
        consent,
        source,
        property_id: propertyId ?? null,
        project_id: projectId ?? null,
      })
      setConfirmation(result.message)
      setState('done')
    } catch (error) {
      setState('idle')
      if (error instanceof ApiError) {
        setFailure(error.message)
        setErrors(
          Object.fromEntries(error.fields.map((item) => [item.field.split('.').pop() ?? item.field, item.message])),
        )
      } else {
        setFailure('Something went wrong. Please try again.')
      }
    }
  }

  if (state === 'done') {
    return (
      <SuccessNote title="Enquiry received" copy={confirmation} />
    )
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'space-y-5' : 'space-y-6'} noValidate>
      <div>
        <h3 className="font-serif text-2xl text-ink">{heading}</h3>
        <p className="mt-2 text-sm text-ink/70">{intro}</p>
      </div>

      {failure && <ErrorNote message={failure} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Full name"
          name="name"
          required
          value={values.name}
          error={errors.name}
          onChange={(value) => update('name', value)}
          placeholder="Your name"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={values.email}
          error={errors.email}
          onChange={(value) => update('email', value)}
          placeholder="you@example.com"
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(value) => update('phone', value)}
          placeholder="Include your country code"
        />
        <TextField
          label="Company"
          name="company"
          value={values.company}
          error={errors.company}
          onChange={(value) => update('company', value)}
        />
      </div>

      <SelectField
        label="Enquiry type"
        name="inquiry_type"
        required
        value={values.inquiry_type}
        error={errors.inquiry_type}
        onChange={(value) => update('inquiry_type', value)}
        options={options}
      />

      <TextAreaField
        label={messageLabel}
        name="message"
        required
        rows={5}
        value={values.message}
        error={errors.message}
        onChange={(value) => update('message', value)}
        placeholder="Share the location, budget and timing you have in mind."
      />

      <ConsentField
        name="consent"
        checked={consent}
        error={errors.consent}
        onChange={setConsent}
      >
        I agree that UrbanLedge may use these details to respond to my enquiry, as described in the{' '}
        <a href="/privacy" className="text-gold-deep underline">
          privacy policy
        </a>
        .
      </ConsentField>

      <button type="submit" className="btn-gold" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : submitLabel}
      </button>

      <p className="text-xs text-warmgray">
        This demonstration site stores submissions in its local database only.
      </p>
    </form>
  )
}
