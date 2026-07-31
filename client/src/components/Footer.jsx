import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaXTwitter } from 'react-icons/fa6';

const Footer = () => (
  <footer className="mt-24 border-t border-black/10 dark:border-white/10 bg-mist-soft/50 dark:bg-ink-soft">
    <div className="section-pad page-wrap py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div className="md:col-span-1">
        <Link to="/" className="font-display text-3xl text-gold">
          LuxeWatch
        </Link>
        <p className="mt-4 text-sm text-slate-mute leading-relaxed">
          Crafting timeless elegance since 2024. Premium timepieces for those who value precision and
          style.
        </p>
      </div>
      <div>
        <h4 className="text-sm tracking-[0.2em] uppercase mb-4">Shop</h4>
        <ul className="space-y-2 text-sm text-slate-mute">
          <li>
            <Link to="/products" className="hover:text-gold">
              All Watches
            </Link>
          </li>
          <li>
            <Link to="/products?sort=newest" className="hover:text-gold">
              New Arrivals
            </Link>
          </li>
          <li>
            <Link to="/products?bestseller=true" className="hover:text-gold">
              Best Sellers
            </Link>
          </li>
          <li>
            <Link to="/products?featured=true" className="hover:text-gold">
              Featured
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm tracking-[0.2em] uppercase mb-4">Support</h4>
        <ul className="space-y-2 text-sm text-slate-mute">
          <li>
            <Link to="/track-order" className="hover:text-gold">
              Track Order
            </Link>
          </li>
          <li>
            <Link to="/cart" className="hover:text-gold">
              Cart
            </Link>
          </li>
          <li>
            <Link to="/checkout" className="hover:text-gold">
              Checkout
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-gold">
              Staff Login
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm tracking-[0.2em] uppercase mb-4">Connect</h4>
        <p className="text-sm text-slate-mute">Follow us for new arrivals.</p>
        <div className="flex gap-4 mt-3">
          <span className="text-slate-mute" aria-hidden>
            <FaInstagram size={20} />
          </span>
          <span className="text-slate-mute" aria-hidden>
            <FaFacebookF size={20} />
          </span>
          <span className="text-slate-mute" aria-hidden>
            <FaXTwitter size={20} />
          </span>
        </div>
      </div>
    </div>
    <div className="section-pad page-wrap py-6 border-t border-black/5 dark:border-white/5 text-center text-xs text-slate-mute tracking-wider">
      © {new Date().getFullYear()} LuxeWatch. All rights reserved.
    </div>
  </footer>
);

export default Footer;
