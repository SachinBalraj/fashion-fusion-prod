import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_SHOWCASE_IMAGES,
  DEFAULT_SHOWCASE_DESCRIPTIONS,
  DEFAULT_COLLECTION_SLUGS,
} from '@/src/constants/showcaseDefaults';

const SLOT_COUNT = 5;

function ShowcaseCard({ image, title, description, slug, index, showDescriptions }) {
  const [failed, setFailed] = useState(false);

  const isFirst = index === 0;
  const href = `/products/${slug}`;

  return (
    <Link
      to={href}
      className="group flex cursor-pointer flex-col outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
      aria-label={title || description ? `${title || description} — view collection` : `View ${slug} collection`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        {failed ? (
          <div className="absolute inset-0 bg-[#F0EDE7]" />
        ) : (
          <img
            src={image}
            alt=""
            width={400}
            height={500}
            loading={isFirst ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'auto'}
            decoding="async"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      {title ? (
        <p
          className={`line-clamp-1 min-h-[20px] px-2 pt-2 text-center text-sm font-semibold leading-5 text-gray-900 ${showDescriptions ? '' : 'pb-2'}`}
        >
          {title}
        </p>
      ) : (
        <div className={`pt-2 ${showDescriptions ? '' : 'pb-2'}`} />
      )}
      {showDescriptions && (
        <p className="mx-auto line-clamp-2 min-h-10 max-w-full px-2 pb-1 text-center text-[13px] font-normal leading-5 text-gray-500 md:text-sm group-hover:text-gray-900">
          {description}
        </p>
      )}
    </Link>
  );
}

export default function ProductShowcase({ images = [], showDescriptions = true }) {
  const adminBySlot = new Map();
  for (const entry of Array.isArray(images) ? images : []) {
    if (entry && Number.isInteger(Number(entry.slot))) {
      adminBySlot.set(Number(entry.slot), {
        image: entry.image || '',
        title: entry.title || '',
        description: entry.description || '',
        slug: entry.slug || '',
      });
    }
  }

  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => {
    const slot = i + 1;
    const admin = adminBySlot.get(slot) || {};
    return {
      slot,
      slug: (admin.slug || '').trim() || DEFAULT_COLLECTION_SLUGS[i],
      image: admin.image || DEFAULT_SHOWCASE_IMAGES[i],
      title: (admin.title || '').trim(),
      description: (admin.description || '').trim() || DEFAULT_SHOWCASE_DESCRIPTIONS[i],
    };
  });

  return (
    <div className="grid grid-cols-2 gap-4 max-[360px]:grid-cols-1 md:grid-cols-3 xl:grid-cols-5 sm:gap-5 lg:gap-6">
      {slots.map((entry, index) => (
        <ShowcaseCard key={entry.slot} {...entry} index={index} showDescriptions={showDescriptions} />
      ))}
    </div>
  );
}