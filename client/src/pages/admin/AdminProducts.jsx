import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { mediaUrl, formatPrice } from '../../api/axios';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  category: '',
  stock: '',
  brand: 'LuxeWatch',
  features: '',
  isFeatured: false,
  isTrending: false,
  isBestSeller: false,
  movement: '',
  caseMaterial: '',
  strapMaterial: '',
  waterResistance: '',
  dialColor: '',
  caseSize: '',
  gender: 'Unisex',
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    api
      .get('/products/admin/all')
      .then((r) => setProducts(r.data.products))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api
      .get('/categories')
      .then((r) => setCategories(r.data.categories))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      comparePrice: product.comparePrice ?? '',
      category: product.category?._id || product.category || '',
      stock: product.stock ?? '',
      brand: product.brand || 'LuxeWatch',
      features: (product.features || []).join(', '),
      isFeatured: product.isFeatured || false,
      isTrending: product.isTrending || false,
      isBestSeller: product.isBestSeller || false,
      movement: product.specifications?.movement || '',
      caseMaterial: product.specifications?.caseMaterial || '',
      strapMaterial: product.specifications?.strapMaterial || '',
      waterResistance: product.specifications?.waterResistance || '',
      dialColor: product.specifications?.dialColor || '',
      caseSize: product.specifications?.caseSize || '',
      gender: product.specifications?.gender || 'Unisex',
    });
    setImages([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('comparePrice', form.comparePrice || 0);
    fd.append('category', form.category);
    fd.append('stock', form.stock);
    fd.append('brand', form.brand);
    fd.append('isFeatured', form.isFeatured);
    fd.append('isTrending', form.isTrending);
    fd.append('isBestSeller', form.isBestSeller);

    const featuresArr = form.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
    fd.append('features', JSON.stringify(featuresArr));

    fd.append(
      'specifications',
      JSON.stringify({
        movement: form.movement,
        caseMaterial: form.caseMaterial,
        strapMaterial: form.strapMaterial,
        waterResistance: form.waterResistance,
        dialColor: form.dialColor,
        caseSize: form.caseSize,
        gender: form.gender,
      })
    );

    images.forEach((file) => fd.append('images', file));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData();
      if (editing) {
        const res = await api.put(`/products/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts((prev) => prev.map((p) => (p._id === editing._id ? res.data.product : p)));
        toast.success('Product updated');
      } else {
        const res = await api.post('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts((prev) => [res.data.product, ...prev]);
        toast.success('Product created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl mb-1">Products</h1>
          <p className="text-slate-mute text-sm">Manage your watch collection</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary text-sm">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-mute">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-slate-mute">No products yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wider uppercase text-slate-mute border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="p-4">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className={`border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-gold/[0.03] ${
                      !product.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-4">
                      <img
                        src={mediaUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-12 h-12 object-cover bg-black/5"
                      />
                    </td>
                    <td className="p-4 font-medium max-w-[200px] truncate">{product.name}</td>
                    <td className="p-4 text-gold">{formatPrice(product.price)}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4 text-slate-mute">{product.category?.name || '—'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="p-2 hover:text-gold transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          className="p-2 hover:text-red-500 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto bg-black/60">
          <div className="glass-strong w-full max-w-2xl my-8 p-6 relative">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 hover:text-gold"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-2xl mb-6">
              {editing ? 'Edit Product' : 'Add Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs tracking-wider uppercase text-slate-mute">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="input-field mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs tracking-wider uppercase text-slate-mute">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="input-field mt-1 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-slate-mute">Price</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-slate-mute">
                    Compare Price
                  </label>
                  <input
                    name="comparePrice"
                    type="number"
                    min="0"
                    value={form.comparePrice}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-slate-mute">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="input-field mt-1"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-slate-mute">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-slate-mute">Brand</label>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-slate-mute">
                    Features (comma-separated)
                  </label>
                  <input
                    name="features"
                    value={form.features}
                    onChange={handleChange}
                    placeholder="Sapphire crystal, Automatic movement"
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {['isFeatured', 'isTrending', 'isBestSeller'].map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name={key}
                      checked={form[key]}
                      onChange={handleChange}
                      className="accent-gold"
                    />
                    <span className="capitalize">{key.replace('is', '').replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>

              <div>
                <p className="text-xs tracking-wider uppercase text-slate-mute mb-2">Specifications</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    ['movement', 'Movement'],
                    ['caseMaterial', 'Case Material'],
                    ['strapMaterial', 'Strap Material'],
                    ['waterResistance', 'Water Resistance'],
                    ['dialColor', 'Dial Color'],
                    ['caseSize', 'Case Size'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="text-xs text-slate-mute">{label}</label>
                      <input
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="input-field mt-1 py-2 text-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-slate-mute">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="input-field mt-1 py-2 text-sm"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs tracking-wider uppercase text-slate-mute">
                  Images {editing && '(adds to existing)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                  className="input-field mt-1 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-gold file:text-ink file:text-xs"
                />
                {editing?.images?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {editing.images.map((img, i) => (
                      <img
                        key={i}
                        src={mediaUrl(img)}
                        alt=""
                        className="w-14 h-14 object-cover bg-black/5"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={closeModal} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
