import { Link } from 'react-router-dom'

import { IconArrow } from '@/components/icons'
import { DemoTag, Img, cx } from '@/components/ui/Primitives'
import { formatPrice } from '@/lib/format'
import type { ArticleSummary, Project, Property } from '@/lib/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card-hover group">
      <Link to={`/projects/${project.slug}`} className="block">
        <div className="relative overflow-hidden bg-forest">
          <Img src={project.hero_image} alt={project.title} ratio="4 / 5" />
          {project.is_demo && <DemoTag className="absolute right-3 top-3" />}
        </div>
        <div className="flex items-start justify-between gap-4 pt-4">
          <div>
            <h3 className="font-serif text-xl text-ink">{project.title}</h3>
            <p className="mt-1 font-sans text-[0.66rem] uppercase tracking-label text-warmgray">
              {project.category} · {project.location}
            </p>
          </div>
          <IconArrow className="mt-1 h-4 w-4 shrink-0 text-gold-deep transition-transform duration-base group-hover:translate-x-1" />
        </div>
      </Link>
    </article>
  )
}

interface PropertyCardProps {
  property: Property
  view?: 'grid' | 'list'
  onSave?: (property: Property) => void
  saved?: boolean
  canSave?: boolean
}

export function PropertyCard({ property, view = 'grid', onSave, saved, canSave }: PropertyCardProps) {
  const facts = [
    property.bedrooms !== null ? `${property.bedrooms} bed` : null,
    property.bathrooms !== null ? `${property.bathrooms} bath` : null,
    property.area_sqm ? `${Math.round(property.area_sqm)} m²` : null,
  ].filter(Boolean) as string[]

  return (
    <article className={cx('group border border-hairline bg-white', view === 'list' && 'sm:flex')}>
      <Link
        to={`/properties/${property.slug}`}
        className={cx('block overflow-hidden bg-forest', view === 'list' && 'sm:w-2/5')}
      >
        <Img src={property.images?.[0]} alt={property.title} ratio={view === 'list' ? '4 / 3' : '4 / 3'} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[0.64rem] uppercase tracking-label text-gold-deep">
              {property.transaction_type === 'rent' ? 'To rent' : 'For sale'} · {property.property_type}
            </p>
            <h3 className="mt-2 font-serif text-xl leading-snug">
              <Link to={`/properties/${property.slug}`} className="hover:text-gold-deep">
                {property.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-ink/65">{property.location}</p>
          </div>
          {canSave && (
            <button
              type="button"
              onClick={() => onSave?.(property)}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${property.title} from shortlist` : `Save ${property.title} to shortlist`}
              className={cx(
                'flex h-9 w-9 shrink-0 items-center justify-center border transition-colors duration-base',
                saved ? 'border-gold bg-gold text-white' : 'border-hairline text-ink hover:border-gold',
              )}
            >
              {saved ? '★' : '☆'}
            </button>
          )}
        </div>

        <p className="mt-4 font-sans text-sm uppercase tracking-label text-ink">
          {formatPrice(property.price, property.currency, property.price_period)}
        </p>
        {facts.length > 0 && (
          <p className="mt-2 text-xs text-warmgray">{facts.join(' · ')}</p>
        )}
        <p className="mt-4 line-clamp-2 flex-1 text-sm text-ink/70">{property.excerpt}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
            Ref {property.reference} · {property.listing_status.replace(/_/g, ' ')}
          </span>
          <Link to={`/properties/${property.slug}`} className="link-arrow text-gold-deep hover:text-ink">
            View <IconArrow className="h-4 w-4" />
          </Link>
        </div>
        {property.is_demo && <DemoTag className="mt-4 self-start" />}
      </div>
    </article>
  )
}

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="card-hover group">
      <Link to={`/insights/${article.slug}`} className="block">
        <div className="overflow-hidden bg-forest">
          <Img src={article.cover_image} alt={article.title} ratio="16 / 10" />
        </div>
        <p className="mt-4 font-sans text-[0.64rem] uppercase tracking-label text-gold-deep">
          {article.category} · {article.reading_minutes} min read
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug group-hover:text-gold-deep">{article.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink/70">{article.excerpt}</p>
      </Link>
    </article>
  )
}
