import { useState } from 'react'

import { CrudManager, type CrudField } from '@/components/admin/CrudManager'
import { cx } from '@/components/ui/Primitives'
import { formatDate } from '@/lib/format'

const SERVICE_FIELDS: CrudField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
  { name: 'summary', label: 'Summary', type: 'textarea', rows: 3, wide: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 8, wide: true },
  {
    name: 'icon',
    label: 'Icon',
    type: 'select',
    options: ['building', 'leaf', 'community', 'layers', 'chart'],
  },
  { name: 'image', label: 'Image URL', type: 'text', wide: true },
  { name: 'deliverables', label: 'Deliverables', type: 'list', rows: 5, hint: 'One per line.', wide: true },
  {
    name: 'process',
    label: 'Process steps',
    type: 'json',
    rows: 8,
    hint: 'JSON array of { "step": "01", "title": "Discover", "copy": "…" }.',
    wide: true,
  },
  {
    name: 'related_project_slugs',
    label: 'Related project slugs',
    type: 'list',
    rows: 3,
    hint: 'One slug per line.',
    wide: true,
  },
  { name: 'display_order', label: 'Display order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

const ARTICLE_FIELDS: CrudField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
  { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 3, wide: true },
  { name: 'content', label: 'Body', type: 'textarea', rows: 12, hint: 'Blank line between paragraphs; start a line with "## " for a subhead.', wide: true },
  { name: 'cover_image', label: 'Cover image', type: 'text', wide: true },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'author', label: 'Author', type: 'text' },
  { name: 'published_at', label: 'Publication date', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
  { name: 'reading_minutes', label: 'Reading minutes', type: 'number' },
  { name: 'seo_title', label: 'SEO title', type: 'text' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
]

const FAQ_FIELDS: CrudField[] = [
  { name: 'question', label: 'Question', type: 'text', required: true, wide: true },
  { name: 'answer', label: 'Answer', type: 'textarea', rows: 5, required: true, wide: true },
  { name: 'display_order', label: 'Display order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

const GALLERY_FIELDS: CrudField[] = [
  { name: 'title', label: 'Title', type: 'text', wide: true },
  { name: 'image', label: 'Image URL', type: 'text', required: true, wide: true },
  { name: 'caption', label: 'Caption', type: 'textarea', rows: 3, wide: true },
  { name: 'credit', label: 'Credit', type: 'text' },
  { name: 'category', label: 'Category', type: 'text', hint: 'architecture, interiors, placemaking…' },
  { name: 'project_id', label: 'Project id', type: 'number' },
  { name: 'display_order', label: 'Display order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

type Tab = 'services' | 'articles' | 'faqs' | 'gallery'

const TABS: { id: Tab; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'articles', label: 'Insights' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'gallery', label: 'Gallery' },
]

export function AdminContentPage() {
  const [tab, setTab] = useState<Tab>('services')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Content</h1>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          Editorial content shown across the public site. Changes appear immediately.
        </p>
      </div>

      <div role="tablist" aria-label="Content types" className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cx(
              'border px-5 py-2 font-sans text-[0.66rem] uppercase tracking-label',
              tab === item.id ? 'border-gold bg-gold text-white' : 'border-hairline bg-white text-ink hover:border-gold',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'services' && (
          <CrudManager
            resource="services"
            singular="Service"
            plural="Services"
            description="The four (or more) service lines shown on the home page and services page."
            columns={[
              { name: 'title', label: 'Title' },
              { name: 'icon', label: 'Icon' },
              { name: 'deliverables', label: 'Deliverables' },
              { name: 'display_order', label: 'Order' },
              { name: 'published', label: 'Published' },
            ]}
            fields={SERVICE_FIELDS}
            defaults={{ icon: 'building', published: true, display_order: 0, process: [] }}
          />
        )}

        {tab === 'articles' && (
          <CrudManager
            resource="articles"
            singular="Article"
            plural="Insights"
            description="Editorial articles. Only published articles appear on the public insights page."
            columns={[
              { name: 'title', label: 'Title' },
              { name: 'category', label: 'Category' },
              { name: 'author', label: 'Author' },
              {
                name: 'published_at',
                label: 'Published',
                render: (row) => (row.published_at ? formatDate(String(row.published_at)) : 'Not dated'),
              },
              { name: 'status', label: 'Status' },
              { name: 'reading_minutes', label: 'Minutes' },
            ]}
            fields={ARTICLE_FIELDS}
            defaults={{
              category: 'Market insights',
              author: 'UrbanLedge Editorial',
              status: 'draft',
              reading_minutes: 5,
              is_demo: true,
            }}
          />
        )}

        {tab === 'faqs' && (
          <CrudManager
            resource="faqs"
            singular="FAQ"
            plural="FAQs"
            description="Questions shown on the contact page."
            columns={[
              { name: 'question', label: 'Question' },
              { name: 'answer', label: 'Answer' },
              { name: 'display_order', label: 'Order' },
              { name: 'published', label: 'Published' },
            ]}
            fields={FAQ_FIELDS}
            defaults={{ published: true, display_order: 0, is_demo: true }}
          />
        )}

        {tab === 'gallery' && (
          <CrudManager
            resource="gallery"
            singular="Image"
            plural="Gallery"
            description="Images shown in the public gallery, grouped by category."
            columns={[
              { name: 'title', label: 'Title' },
              { name: 'category', label: 'Category' },
              { name: 'project_id', label: 'Project id' },
              { name: 'display_order', label: 'Order' },
              { name: 'published', label: 'Published' },
            ]}
            fields={GALLERY_FIELDS}
            defaults={{ category: 'architecture', published: true, display_order: 0, is_demo: true }}
          />
        )}
      </div>
    </div>
  )
}
