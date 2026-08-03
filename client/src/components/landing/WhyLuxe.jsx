import { motion } from 'framer-motion';
import { Gem, Shield, Sparkles, Timer } from 'lucide-react';

const pillars = [
  {
    icon: Gem,
    title: 'Atelier Craft',
    body: 'Every movement is finished by hand — polished, regulated, and tested for lasting precision.',
  },
  {
    icon: Shield,
    title: 'Lifetime Assurance',
    body: 'International warranty and authenticated provenance with every Luxe Watches purchase.',
  },
  {
    icon: Sparkles,
    title: 'Material Poetry',
    body: '18k gold accents, sapphire crystal, and bracelets engineered for lifelong comfort.',
  },
  {
    icon: Timer,
    title: 'Timeless Design',
    body: 'Silhouettes that outlast seasons — quiet luxury for those who refuse the ordinary.',
  },
];

export default function WhyLuxe() {
  return (
    <section className="section-pad page-wrap py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="text-center mb-14"
      >
        <h2 className="section-title">Why Choose Luxe Watches</h2>
        <p className="section-sub max-w-lg mx-auto">
          A quieter kind of excellence — measured in microns, moments, and meaning.
        </p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="liquid-glass liquid-panel glow-border p-6 md:p-7 group"
          >
            <p.icon
              className="text-gold mb-5 transition-transform duration-300 group-hover:scale-110"
              size={26}
              strokeWidth={1.5}
            />
            <h3 className="font-display text-2xl text-mist mb-2">{p.title}</h3>
            <p className="text-sm text-mist/55 leading-relaxed">{p.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
