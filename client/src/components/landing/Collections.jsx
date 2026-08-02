import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionHeader, EmptyRow } from './SectionHeader';

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=480&q=70';

export default function Collections({ categories = [], loading }) {
  return (
    <section className="section-pad page-wrap py-20">
      <SectionHeader title="Collections" subtitle="Find your signature style" />
      {loading && categories.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyRow label="Collections loading soon" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 8).map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <Link
                to={`/products?category=${cat._id}`}
                className="group relative block aspect-[3/4] overflow-hidden glow-border"
              >
                <img
                  src={cat.image || FALLBACK}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={640}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK;
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <h3 className="font-display text-2xl text-mist group-hover:text-gold transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
