import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
} from 'lucide-react';
import { toggleTheme } from '../store/themeSlice';
import { logout } from '../store/authSlice';
import { selectCartCount } from '../store/cartSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((s) => s.auth);
  const theme = useSelector((s) => s.theme.mode);
  const cartCount = useSelector(selectCartCount);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const isHome = location.pathname === '/';
  const lightText = theme === 'dark' || isHome || menuOpen;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
      setMenuOpen(false);
    }
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Collection' },
    { to: '/track-order', label: 'Track Order' },
  ];

  const navInk = lightText ? 'text-mist' : 'text-ink';
  const muted = lightText ? 'text-mist/75 hover:text-gold' : 'text-ink/70 hover:text-gold';
  const iconBtn = lightText
    ? 'p-2 text-mist/90 hover:text-gold transition-colors duration-200'
    : 'p-2 text-ink/80 hover:text-gold transition-colors duration-200';

  const headerSurface =
    scrolled || menuOpen
      ? isHome || theme === 'dark'
        ? 'liquid-glass border-b border-gold/15 py-3'
        : 'liquid-glass-light border-b border-black/10 py-3'
      : 'bg-transparent py-5';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-[padding,background-color] duration-300 ${navInk} ${headerSurface}`}
    >
      <div className="section-pad page-wrap flex items-center justify-between gap-4">
        <button
          type="button"
          className={`lg:hidden ${iconBtn}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link
          to="/"
          className="font-display text-2xl md:text-3xl tracking-wide text-gold hover:text-gold-light transition-colors"
        >
          Luxe Watches
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase transition-colors ${
                  isActive ? 'text-gold' : muted
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => setSearchOpen(!searchOpen)} className={iconBtn} aria-label="Search">
            <Search size={20} />
          </button>
          <button type="button" onClick={() => dispatch(toggleTheme())} className={iconBtn} aria-label="Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/cart" className={`${iconBtn} relative`} aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-ink text-[10px] flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {token ? (
            <div className="relative group">
              <Link to="/admin" className={iconBtn} aria-label="Account">
                <User size={20} />
              </Link>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="liquid-glass text-mist py-2 min-w-[160px] text-sm shadow-xl">
                  <p className="px-4 py-1 text-mist/50 truncate">{user?.name}</p>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-mist/85 hover:text-gold">
                      <LayoutDashboard size={14} /> Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(logout());
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-mist/85 hover:text-gold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearch} className="section-pad page-wrap">
          <div className="py-4 flex gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search watches..."
              className="input-field"
            />
            <button type="submit" className="btn-primary btn-lux">
              Search
            </button>
          </div>
        </form>
      )}

      {menuOpen && (
        <nav className="lg:hidden section-pad py-6 flex flex-col gap-4 border-t border-gold/10 liquid-glass text-mist">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="text-lg tracking-widest uppercase text-mist/90 hover:text-gold transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
