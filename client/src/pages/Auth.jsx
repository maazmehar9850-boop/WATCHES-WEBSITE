import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { login, logout, clearError } from '../store/authSlice';

/** Admin / staff login only — customers order as guests */
const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);
  const from = location.state?.from?.pathname || '/admin';

  const [form, setForm] = useState({ email: '', password: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const res = await dispatch(login({ email: form.email, password: form.password }));
    if (res.meta.requestStatus === 'fulfilled') {
      const user = res.payload.user;
      if (user.role !== 'admin') {
        dispatch(logout());
        toast.error('Admin access only');
        return;
      }
      toast.success('Welcome back!');
      const dest = from.startsWith('/admin') ? from : '/admin';
      navigate(dest);
    } else {
      toast.error(res.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200"
          alt="LuxeWatch"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/50 flex items-end p-12">
          <div>
            <p className="font-display text-5xl text-gold">LuxeWatch</p>
            <p className="text-mist/80 mt-2 tracking-wide">Admin access</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center section-pad py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="font-display text-3xl text-gold lg:hidden">LuxeWatch</Link>
          <h1 className="font-display text-4xl mt-6 mb-2">Staff Login</h1>
          <p className="text-slate-mute text-sm mb-8">
            Customers can shop and checkout without an account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs tracking-wider uppercase text-slate-mute">Email</label>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-slate-mute">Password</label>
              <input
                required
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="input-field mt-1"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-mute text-center">
            <Link to="/" className="text-gold">Back to store</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
