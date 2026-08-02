import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Enter a valid email');
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setEmail('');
      toast.success('Welcome to the private list');
    }, 600);
  };

  return (
    <section className="section-pad page-wrap py-20 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="liquid-glass glow-border relative overflow-hidden px-6 py-14 md:px-14 md:py-16 text-center"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(212,175,55,0.2), transparent 60%)',
          }}
        />
        <h2 className="relative section-title">Join the Inner Circle</h2>
        <p className="relative section-sub max-w-md mx-auto mb-8">
          Private previews, limited editions, and atelier stories — never noise.
        </p>
        <form
          onSubmit={submit}
          className="relative mx-auto flex flex-col sm:flex-row gap-3 max-w-lg"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="input-field bg-ink/40 border-gold/25 text-mist flex-1"
            autoComplete="email"
          />
          <button type="submit" disabled={busy} className="btn-primary btn-lux shrink-0">
            {busy ? 'Joining…' : 'Subscribe'}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
