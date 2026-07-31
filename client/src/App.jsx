import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { AdminRoute } from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Auth = lazy(() => import('./pages/Auth'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCouriers = lazy(() => import('./pages/admin/AdminCouriers'));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-mist dark:bg-ink">
    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141416',
            color: '#f5f2eb',
            border: '1px solid rgba(201,162,39,0.3)',
          },
        }}
      />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="track-order" element={<TrackOrder />} />
            <Route path="order-success/:id" element={<OrderSuccess />} />
            <Route path="dashboard" element={<Navigate to="/track-order" replace />} />
            <Route path="wishlist" element={<Navigate to="/products" replace />} />
          </Route>

          {/* Hidden admin login — not linked in public nav */}
          <Route path="admin-login" element={<Auth />} />
          <Route path="login" element={<Navigate to="/admin-login" replace />} />

          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="couriers" element={<AdminCouriers />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
