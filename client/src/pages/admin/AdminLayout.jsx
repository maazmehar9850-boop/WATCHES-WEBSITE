import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Truck,
  Menu,
  X,
  LogOut,
  Store,
} from 'lucide-react';
import { logout } from '../../store/authSlice';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/couriers', label: 'Couriers', icon: Truck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 ${
      isActive
        ? 'bg-gold/15 text-gold border-l-2 border-gold'
        : 'text-slate-mute hover:text-gold hover:bg-gold/5'
    }`;

  return (
    <div className="min-h-screen bg-mist dark:bg-ink flex">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 glass-strong flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-black/10 dark:border-white/10">
          <Link to="/admin" className="font-display text-2xl text-gold tracking-wide">
            Admin Panel
          </Link>
          <p className="text-xs text-slate-mute mt-1 truncate">{user?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={closeSidebar}>
              <Icon size={18} />
              <span className="text-sm tracking-wide">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-black/10 dark:border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-mute hover:text-gold transition-colors"
            onClick={closeSidebar}
          >
            <Store size={18} />
            Back to Store
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-slate-mute hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass-strong px-4 py-4 flex items-center gap-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:text-gold transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-display text-xl text-gold">LuxeWatch Admin</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className={`ml-auto p-2 ${sidebarOpen ? 'block' : 'hidden'}`}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
