import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { mediaUrl } from '../../api/axios';

const emptyForm = { name: '', description: '' };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    api
      .get('/categories/admin/all')
      .then((r) => setCategories(r.data.categories))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImage(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
    });
    setImage(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (image) fd.append('image', image);

      if (editing) {
        const res = await api.put(`/categories/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories((prev) => prev.map((c) => (c._id === editing._id ? res.data.category : c)));
        toast.success('Category updated');
      } else {
        const res = await api.post('/categories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories((prev) => [...prev, res.data.category].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Category created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl mb-1">Categories</h1>
          <p className="text-slate-mute text-sm">Organize your product catalog</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary text-sm">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-mute">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-slate-mute">No categories yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wider uppercase text-slate-mute border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="p-4">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-gold/[0.03]"
                  >
                    <td className="p-4">
                      {category.image ? (
                        <img
                          src={mediaUrl(category.image)}
                          alt={category.name}
                          className="w-12 h-12 object-cover bg-black/5"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-black/5 flex items-center justify-center text-xs text-slate-mute">
                          —
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium">{category.name}</td>
                    <td className="p-4 text-slate-mute max-w-xs truncate">
                      {category.description || '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="p-2 hover:text-gold transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category._id)}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="glass-strong w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 hover:text-gold"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-2xl mb-6">
              {editing ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs tracking-wider uppercase text-slate-mute">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs tracking-wider uppercase text-slate-mute">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="input-field mt-1 resize-none"
                />
              </div>
              <div>
                <label className="text-xs tracking-wider uppercase text-slate-mute">
                  Image {editing && '(optional, replaces current)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="input-field mt-1 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-gold file:text-ink file:text-xs"
                />
                {editing?.image && !image && (
                  <img
                    src={mediaUrl(editing.image)}
                    alt=""
                    className="w-20 h-20 object-cover mt-2 bg-black/5"
                  />
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
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

export default AdminCategories;
