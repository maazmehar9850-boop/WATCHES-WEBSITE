import { motion } from 'framer-motion';

/** Shared section header with scroll reveal. */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="section-sub">{subtitle}</p> : null}
      </motion.div>
      {action}
    </div>
  );
}

export function EmptyRow({ label = 'Collection arriving soon' }) {
  return (
    <div className="liquid-glass glow-border liquid-panel py-16 text-center text-mist/50 text-sm tracking-widest uppercase">
      {label}
    </div>
  );
}
