import { useEffect, useState, type FormEvent } from 'react'

import { ConsentField, SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { ErrorNote, SuccessNote } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { useInquiryTypes } from '@/context/SiteContext'
import { ApiError, api } from '@/lib/api'
import type { Submission } from '@/lib/types'

const TIME_SLOTS = [
  'Morning (09:00 – 12:00)',
  'Afternoon (13:00 – 17:00)',
  'Late afternoon (17:00 – 19:00)',
]

const BUDGETS = ['Under 500k', '500k – 1M', '1M – 3M', '3M – 10M', 'Above 10M', 'Not decided yet']

/** Booking form for a consultation. Preferred times are requests, not confirmed slots. */
export function ConsultationForm() {
  const { user } = useAuth()
  const inquiryTypes = useInquiryTypes()
  const options = (inquiryTypes.length ? inquiryTypes : ['General inquiry']).map((value) => ({
    value,
    label: value,
  }))

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiry_type: options[0]?.value ?? 'General inquiry',
    preferred_date: '',
    preferred_time: TIME_SLOTS[0],
    timezone: 'UTC',
    project_location: '',
    budget: '',
    description: '',
  })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [failure, setFailure] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (zone) setValues((prev) => ({ ...prev, timezone: zone }))
    } catch {
      /* keep the default */
    }
  }, [])

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
      const result = await api.post<Submission>('/consultations', {
        ...values,
        phone: values.phone || null,
        company: values.company || null,
        preferred_date: values.preferred_date || null,
        project_location: values.project_location || null,
        budget: values.budget || null,
        consent,
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
    return <SuccessNote title="Consultation requested" copy={confirmation} />
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {failure && <ErrorNote message={failure} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Full name"
          name="name"
          required
          value={values.name}
          error={errors.name}
          onChange={(value) => update('name', value)}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={values.email}
          error={errors.email}
          onChange={(value) => update('email', value)}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(value) => update('phone', value)}
        />
        <TextField
          label="Company"
          name="company"
          value={values.company}
          error={errors.company}
          onChange={(value) => update('company', value)}
        />
        <SelectField
          label="What is this about?"
          name="inquiry_type"
          required
          value={values.inquiry_type}
          error={errors.inquiry_type}
          onChange={(value) => update('inquiry_type', value)}
          options={options}
        />
        <TextField
          label="Project location"
          name="project_location"
          value={values.project_location}
          error={errors.project_location}
          onChange={(value) => update('project_location', value)}
          placeholder="City or site"
        />
        <TextField
          label="Preferred date"
          name="preferred_date"
          type="date"
          value={values.preferred_date}
          error={errors.preferred_date}
          hint="Requests only — the team confirms the final slot."
          onChange={(value) => update('preferred_date', value)}
        />
        <SelectField
          label="Preferred time"
          name="preferred_time"
          value={values.preferred_time}
          error={errors.preferred_time}
          onChange={(value) => update('preferred_time', value)}
          options={TIME_SLOTS.map((slot) => ({ value: slot, label: slot }))}
        />
        <TextField
          label="Time zone"
          name="timezone"
          value={values.timezone}
          error={errors.timezone}
          onChange={(value) => update('timezone', value)}
        />
        <SelectField
          label="Indicative budget"
          name="budget"
          value={values.budget}
          error={errors.budget}
          onChange={(value) => update('budget', value)}
          placeholder="Select a range"
          options={BUDGETS.map((item) => ({ value: item, label: item }))}
        />
      </div>

      <TextAreaField
        label="What would you like to cover?"
        name="description"
        required
        rows={5}
        value={values.description}
        error={errors.description}
        onChange={(value) => update('description', value)}
        placeholder="A short brief helps us bring the right people to the call."
      />

      <ConsentField name="consent" checked={consent} error={errors.consent} onChange={setConsent}>
        I agree that UrbanLedge may use these details to arrange the consultation, as described in the{' '}
        <a href="/privacy" className="text-gold-deep underline">
          privacy policy
        </a>
        .
      </ConsentField>

      <button type="submit" className="btn-gold" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Request consultation'}
      </button>
    </form>
  )
}
