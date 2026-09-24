import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_SHOWCASE_IMAGES,
  DEFAULT_SHOWCASE_DESCRIPTIONS,
  DEFAULT_COLLECTION_SLUGS,
} from '@/src/constants/showcaseDefaults';

const SLOT_COUNT = 5;

function ShowcaseCard({ image, description, slug, index }) {
  const [failed, setFailed] = useState(false);

  const isFirst = index === 0;
  const href = `/products/${slug}`;

  return (
    <Link
      to={href}
      className="group flex cursor-pointer flex-col outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
      aria-label={description ? `${description} — view collection` : `View ${slug} collection`}
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
      <p className="mx-auto mt-2 line-clamp-2 min-h-10 max-w-full text-center text-[13px] font-medium leading-5 text-gray-600 md:text-sm group-hover:text-gray-900">
        {description}
      </p>
    </Link>
  );
}

export default function ProductShowcase({ images = [] }) {
  const adminBySlot = new Map();
  for (const entry of Array.isArray(images) ? images : []) {
    if (entry && Number.isInteger(Number(entry.slot))) {
      adminBySlot.set(Number(entry.slot), {
        image: entry.image || '',
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
      description: (admin.description || '').trim() || DEFAULT_SHOWCASE_DESCRIPTIONS[i],
    };
  });

  return (
    <div className="grid grid-cols-2 gap-4 max-[360px]:grid-cols-1 md:grid-cols-3 xl:grid-cols-5 sm:gap-5 lg:gap-6">
      {slots.map((entry, index) => (
        <ShowcaseCard key={entry.slot} {...entry} index={index} />
      ))}
    </div>
  );
}