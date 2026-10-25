import { CrudManager, type CrudField } from '@/components/admin/CrudManager'
import { formatPrice, humanStatus } from '@/lib/format'

const FIELDS: CrudField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
  { name: 'excerpt', label: 'Short summary', type: 'textarea', rows: 3, wide: true },
  { name: 'description', label: 'Full description', type: 'textarea', rows: 8, wide: true },
  {
    name: 'property_type',
    label: 'Property type',
    type: 'select',
    required: true,
    options: ['apartment', 'condominium', 'house', 'townhouse', 'penthouse', 'office', 'retail', 'land'],
  },
  { name: 'transaction_type', label: 'Transaction', type: 'select', required: true, options: ['buy', 'rent'] },
  {
    name: 'listing_status',
    label: 'Listing status',
    type: 'select',
    required: true,
    options: ['available', 'under_offer', 'rented', 'sold', 'withdrawn'],
  },
  { name: 'price', label: 'Price', type: 'number' },
  { name: 'price_period', label: 'Price period', type: 'text', hint: 'e.g. / month for rentals' },
  { name: 'currency', label: 'Currency', type: 'text' },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'address', label: 'Address', type: 'text', wide: true },
  { name: 'area_sqm', label: 'Area (m²)', type: 'number' },
  { name: 'bedrooms', label: 'Bedrooms', type: 'number' },
  { name: 'bathrooms', label: 'Bathrooms', type: 'number' },
  { name: 'furnished', label: 'Furnishing', type: 'text', hint: 'furnished, semi-furnished or unfurnished' },
  { name: 'project_id', label: 'Project id', type: 'number', hint: 'Links the listing to a development project.' },
  { name: 'amenities', label: 'Amenities', type: 'list', rows: 5, hint: 'One amenity per line.', wide: true },
  { name: 'images', label: 'Images', type: 'list', rows: 5, hint: 'One image URL or path per line.', wide: true },
  {
    name: 'floor_plans',
    label: 'Floor plans',
    type: 'pairs',
    rows: 3,
    hint: 'One per line as "Label: url".',
    wide: true,
  },
  {
    name: 'documents',
    label: 'Documents',
    type: 'pairs',
    rows: 3,
    hint: 'One per line as "Label: url".',
    wide: true,
  },
  { name: 'featured', label: 'Featured on the home page', type: 'checkbox' },
  { name: 'is_demo', label: 'Demonstration content', type: 'checkbox' },
  { name: 'seo_title', label: 'SEO title', type: 'text' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
]

export function AdminPropertiesPage() {
  return (
    <CrudManager
      resource="properties"
      singular="Listing"
      plural="Properties"
      description="Create, edit and retire listings. References are generated automatically and a slug is derived from the title."
      columns={[
        { name: 'title', label: 'Title' },
        { name: 'reference', label: 'Reference' },
        { name: 'property_type', label: 'Type', render: (row) => humanStatus(String(row.property_type ?? '')) },
        {
          name: 'listing_status',
          label: 'Status',
          render: (row) => humanStatus(String(row.listing_status ?? '')),
        },
        {
          name: 'price',
          label: 'Price',
          render: (row) =>
            formatPrice(
              row.price === null || row.price === undefined ? null : Number(row.price),
              String(row.currency ?? 'USD'),
              row.price_period ? String(row.price_period) : null,
            ),
        },
        { name: 'location', label: 'Location' },
        { name: 'featured', label: 'Featured' },
        { name: 'is_demo', label: 'Demo' },
      ]}
      fields={FIELDS}
      defaults={{
        transaction_type: 'buy',
        listing_status: 'available',
        property_type: 'apartment',
        currency: 'USD',
        featured: false,
        is_demo: true,
      }}
    />
  )
}

