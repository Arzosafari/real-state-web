import { CrudManager, type CrudField } from '@/components/admin/CrudManager'
import { formatDate, formatPrice } from '@/lib/format'

const FIELDS: CrudField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
  { name: 'tagline', label: 'Tagline', type: 'text', wide: true },
  { name: 'overview', label: 'Overview', type: 'textarea', rows: 3, wide: true },
  { name: 'description', label: 'Full description', type: 'textarea', rows: 6, wide: true },
  { name: 'design_concept', label: 'Design concept', type: 'textarea', rows: 4, wide: true },
  { name: 'category', label: 'Category', type: 'text', required: true, hint: 'Residential, Mixed-use, Hospitality…' },
  { name: 'location', label: 'Location', type: 'text', required: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: ['Planning', 'In development', 'Under construction', 'Completed', 'On hold'],
  },
  { name: 'hero_image', label: 'Hero image', type: 'text', wide: true },
  { name: 'gallery', label: 'Gallery', type: 'list', rows: 5, hint: 'One image per line.', wide: true },
  { name: 'highlights', label: 'Highlights', type: 'list', rows: 4, hint: 'One highlight per line.', wide: true },
  {
    name: 'sustainability',
    label: 'Sustainability',
    type: 'list',
    rows: 4,
    hint: 'One commitment per line.',
    wide: true,
  },
  { name: 'amenities', label: 'Amenities', type: 'list', rows: 4, hint: 'One amenity per line.', wide: true },
  {
    name: 'specifications',
    label: 'Specifications',
    type: 'pairs',
    rows: 4,
    hint: 'One per line as "Label: value".',
    wide: true,
  },
  {
    name: 'services',
    label: 'Services involved',
    type: 'list',
    rows: 3,
    hint: 'Service slugs, one per line.',
    wide: true,
  },
  { name: 'price_from', label: 'Price from', type: 'number' },
  { name: 'currency', label: 'Currency', type: 'text' },
  { name: 'total_area_sqm', label: 'Total area (m²)', type: 'number' },
  { name: 'unit_count', label: 'Unit count', type: 'number' },
  { name: 'bedrooms_range', label: 'Bedrooms range', type: 'text', hint: 'e.g. 1 – 4 bedrooms' },
  { name: 'completion_date', label: 'Completion date', type: 'date' },
  { name: 'developer', label: 'Developer', type: 'text' },
  { name: 'architect', label: 'Architect', type: 'text' },
  { name: 'availability_note', label: 'Availability note', type: 'textarea', rows: 3, wide: true },
  { name: 'featured', label: 'Featured on the home page', type: 'checkbox' },
  { name: 'published', label: 'Published', type: 'checkbox' },
  { name: 'display_order', label: 'Display order', type: 'number' },
  { name: 'is_demo', label: 'Demonstration content', type: 'checkbox' },
  { name: 'seo_title', label: 'SEO title', type: 'text' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
]

export function AdminProjectsPage() {
  return (
    <CrudManager
      resource="projects"
      singular="Project"
      plural="Projects"
      description="Development projects shown on the public portfolio. Unpublished projects are hidden from the site."
      columns={[
        { name: 'title', label: 'Title' },
        { name: 'category', label: 'Category' },
        { name: 'location', label: 'Location' },
        { name: 'status', label: 'Status' },
        {
          name: 'price_from',
          label: 'From',
          render: (row) =>
            row.price_from === null || row.price_from === undefined
              ? 'On application'
              : formatPrice(Number(row.price_from), String(row.currency ?? 'USD')),
        },
        {
          name: 'completion_date',
          label: 'Completion',
          render: (row) => (row.completion_date ? formatDate(String(row.completion_date)) : 'To be confirmed'),
        },
        { name: 'featured', label: 'Featured' },
        { name: 'published', label: 'Published' },
        { name: 'is_demo', label: 'Demo' },
      ]}
      fields={FIELDS}
      defaults={{
        status: 'In development',
        currency: 'USD',
        published: true,
        featured: false,
        is_demo: true,
        display_order: 0,
      }}
    />
  )
}
