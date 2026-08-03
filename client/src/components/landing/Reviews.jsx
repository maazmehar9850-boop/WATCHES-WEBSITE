import { motion } from 'framer-motion';

const reviews = [
  {
    quote:
      'The unboxing felt ceremonial. The watch itself is quieter luxury — weight, light, and absolute precision.',
    name: 'Amira K.',
    role: 'Collector, Dubai',
  },
  {
    quote:
      'I compared it to pieces twice the price. Luxe Watches holds its own in finish and presence on the wrist.',
    name: 'James R.',
    role: 'Horology enthusiast',
  },
  {
    quote:
      'From the cinematic site to the delivery — every detail whispered craft. This is how modern luxury should feel.',
    name: 'Sofia L.',
    role: 'Design director',
  },
];

export default function Reviews() {
  return (
    <section className="section-pad page-wrap py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="section-title">Customer Reviews</h2>
        <p className="section-sub">Voices from the Luxe Watches circle</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <motion.blockquote
            key={r.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="liquid-glass liquid-panel glow-border p-8 flex flex-col"
          >
            <p className="text-mist/80 text-sm leading-relaxed flex-1 font-light">“{r.quote}”</p>
            <footer className="mt-8 pt-5 border-t border-gold/15">
              <cite className="not-italic font-display text-xl text-gold">{r.name}</cite>
              <p className="text-xs tracking-wider uppercase text-mist/40 mt-1">{r.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
