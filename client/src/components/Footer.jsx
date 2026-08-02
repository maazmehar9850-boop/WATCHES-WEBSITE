import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaXTwitter } from 'react-icons/fa6';

const Footer = () => (
  <footer className="mt-0 border-t border-gold/15 bg-[#0B0B0B] text-mist">
    <div className="section-pad page-wrap py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div className="md:col-span-1">
        <Link to="/" className="font-display text-3xl text-gold">
          Luxe Watches
        </Link>
        <p className="mt-4 text-sm text-mist/55 leading-relaxed max-w-xs">
          Crafting timeless elegance since 2024. Precision timepieces for those who measure life in
          moments that matter.
        </p>
      </div>
      <div>
        <h4 className="text-sm tracking-[0.2em] uppercase mb-4 text-gold/90">Shop</h4>
        <ul className="space-y-2 text-sm text-mist/55">
          <li>
            <Link to="/products" className="hover:text-gold transition-colors">
              All Watches
            </Link>
          </li>
          <li>
            <Link to="/products?sort=newest" className="hover:text-gold transition-colors">
              New Arrivals
            </Link>
          </li>
          <li>
            <Link to="/products?bestseller=true" className="hover:text-gold transition-colors">
              Best Sellers
            </Link>
          </li>
          <li>
            <Link to="/products?featured=true" className="hover:text-gold transition-colors">
              Featured
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm tracking-[0.2em] uppercase mb-4 text-gold/90">Support</h4>
        <ul className="space-y-2 text-sm text-mist/55">
          <li>
            <Link to="/track-order" className="hover:text-gold transition-colors">
              Track Order
            </Link>
          </li>
          <li>
            <Link to="/cart" className="hover:text-gold transition-colors">
              Cart
            </Link>
          </li>
          <li>
            <Link to="/checkout" className="hover:text-gold transition-colors">
              Checkout
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm tracking-[0.2em] uppercase mb-4 text-gold/90">Connect</h4>
        <p className="text-sm text-mist/55">Follow for private previews and new arrivals.</p>
        <div className="flex gap-4 mt-3 text-mist/50">
          <span aria-hidden>
            <FaInstagram size={20} />
          </span>
          <span aria-hidden>
            <FaFacebookF size={20} />
          </span>
          <span aria-hidden>
            <FaXTwitter size={20} />
          </span>
        </div>
      </div>
    </div>
    <div className="section-pad page-wrap py-6 border-t border-white/5 text-center text-xs text-mist/40 tracking-wider">
      © {new Date().getFullYear()} Luxe Watches. All rights reserved.
    </div>
  </footer>
);

export default Footer;
