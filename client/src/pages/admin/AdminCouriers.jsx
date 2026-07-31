import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Truck,
  Users,
  Car,
  MapPin,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/axios';

const emptyCourierForm = {
  name: '',
  code: '',
  phone: '',
  email: '',
};

const emptyEmployeeForm = {
  name: '',
  phone: '',
  role: 'Rider',
};

const emptyVehicleForm = {
  type: 'Bike',
  number: '',
  model: '',
};

const AdminCouriers = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courierForm, setCourierForm] = useState(emptyCourierForm);
  const [employeeForms, setEmployeeForms] = useState({});
  const [vehicleForms, setVehicleForms] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const fetchCouriers = useCallback(() => {
    setLoading(true);
    api
      .get('/couriers')
      .then((r) => setCouriers(r.data.couriers || []))
      .catch(() => toast.error('Failed to load couriers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  const getEmployeeForm = (courierId) =>
    employeeForms[courierId] || { ...emptyEmployeeForm };

  const getVehicleForm = (courierId) =>
    vehicleForms[courierId] || { ...emptyVehicleForm };

  const setEmployeeForm = (courierId, patch) => {
    setEmployeeForms((prev) => ({
      ...prev,
      [courierId]: { ...getEmployeeForm(courierId), ...patch },
    }));
  };

  const setVehicleForm = (courierId, patch) => {
    setVehicleForms((prev) => ({
      ...prev,
      [courierId]: { ...getVehicleForm(courierId), ...patch },
    }));
  };

  const handleCreateCourier = async (e) => {
    e.preventDefault();
    if (!courierForm.name.trim() || !courierForm.code.trim()) {
      toast.error('Name and code are required');
      return;
    }
    setSubmitting('create');
    try {
      const res = await api.post('/couriers', {
        name: courierForm.name.trim(),
        code: courierForm.code.trim().toUpperCase(),
        phone: courierForm.phone.trim(),
        email: courierForm.email.trim(),
      });
      setCouriers((prev) => [...prev, res.data.courier].sort((a, b) => a.name.localeCompare(b.name)));
      setCourierForm(emptyCourierForm);
      setShowCreateForm(false);
      toast.success('Courier created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create courier');
    } finally {
      setSubmitting(null);
    }
  };

  const handleAddEmployee = async (courierId) => {
    const form = getEmployeeForm(courierId);
    if (!form.name.trim()) {
      toast.error('Employee name is required');
      return;
    }
    setSubmitting(`emp-${courierId}`);
    try {
      const res = await api.post(`/couriers/${courierId}/employees`, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: form.role.trim() || 'Rider',
      });
      setCouriers((prev) =>
        prev.map((c) => (c._id === courierId ? res.data.courier : c))
      );
      setEmployeeForms((prev) => ({ ...prev, [courierId]: { ...emptyEmployeeForm } }));
      toast.success('Employee added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setSubmitting(null);
    }
  };

  const handleAddVehicle = async (courierId) => {
    const form = getVehicleForm(courierId);
    if (!form.number.trim()) {
      toast.error('Vehicle number is required');
      return;
    }
    setSubmitting(`veh-${courierId}`);
    try {
      const res = await api.post(`/couriers/${courierId}/vehicles`, {
        type: form.type.trim() || 'Bike',
        number: form.number.trim(),
        model: form.model.trim(),
      });
      setCouriers((prev) =>
        prev.map((c) => (c._id === courierId ? res.data.courier : c))
      );
      setVehicleForms((prev) => ({ ...prev, [courierId]: { ...emptyVehicleForm } }));
      toast.success('Vehicle added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeactivate = async (courier) => {
    if (!window.confirm(`Deactivate ${courier.name}?`)) return;
    setSubmitting(`del-${courier._id}`);
    try {
      await api.delete(`/couriers/${courier._id}`);
      setCouriers((prev) =>
        prev.map((c) =>
          c._id === courier._id ? { ...c, isActive: false } : c
        )
      );
      toast.success('Courier deactivated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setSubmitting(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const activeCouriers = couriers.filter((c) => c.isActive !== false);
  const inactiveCouriers = couriers.filter((c) => c.isActive === false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl mb-1">Couriers</h1>
          <p className="text-slate-mute text-sm">
            Manage delivery partners, riders, and vehicles
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={fetchCouriers} className="btn-outline">
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="btn-primary"
          >
            <Plus size={16} /> Add Courier
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateCourier} className="glass-strong p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold flex items-center gap-2">
              <Truck size={20} /> New Courier
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setCourierForm(emptyCourierForm);
              }}
              className="text-slate-mute hover:text-gold"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs tracking-wider uppercase text-slate-mute block mb-1">
                Name *
              </label>
              <input
                type="text"
                value={courierForm.name}
                onChange={(e) => setCourierForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="LuxeWatch Express"
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-slate-mute block mb-1">
                Code *
              </label>
              <input
                type="text"
                value={courierForm.code}
                onChange={(e) => setCourierForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="LWE"
                className="input-field w-full uppercase"
                required
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-slate-mute block mb-1">
                Phone
              </label>
              <input
                type="text"
                value={courierForm.phone}
                onChange={(e) => setCourierForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+92 300 1234567"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-slate-mute block mb-1">
                Email
              </label>
              <input
                type="email"
                value={courierForm.email}
                onChange={(e) => setCourierForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="dispatch@courier.com"
                className="input-field w-full"
              />
            </div>
          </div>
          <button type="submit" disabled={submitting === 'create'} className="btn-primary">
            {submitting === 'create' ? 'Creating...' : 'Create Courier'}
          </button>
        </form>
      )}

      <div className="glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-mute">Loading couriers...</p>
        ) : activeCouriers.length === 0 && inactiveCouriers.length === 0 ? (
          <p className="p-6 text-slate-mute">No couriers yet. Add your first courier above.</p>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {activeCouriers.map((courier) => {
              const isExpanded = expandedId === courier._id;
              const empForm = getEmployeeForm(courier._id);
              const vehForm = getVehicleForm(courier._id);

              return (
                <div key={courier._id}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(courier._id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gold/[0.03] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-sm bg-gold/15 flex items-center justify-center shrink-0">
                      <Truck size={18} className="text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{courier.name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 bg-black/5 dark:bg-white/10 text-slate-mute">
                          {courier.code}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-slate-mute mt-0.5">
                        {courier.phone || 'No phone'}
                        {courier.email ? ` · ${courier.email}` : ''}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-mute">
                        <span>{(courier.employees || []).length} employees</span>
                        <span>{(courier.vehicles || []).length} vehicles</span>
                        <span>{(courier.hubs || []).length} hubs</span>
                      </div>
                    </div>
                    <div className="text-slate-mute shrink-0">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-6 space-y-6">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeactivate(courier)}
                          disabled={submitting === `del-${courier._id}`}
                          className="btn-outline text-sm border-red-500/40 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                          {submitting === `del-${courier._id}` ? 'Deactivating...' : 'Deactivate'}
                        </button>
                      </div>

                      {(courier.hubs || []).length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-mute mb-2 flex items-center gap-2">
                            <MapPin size={14} /> Hubs
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {courier.hubs.map((hub, i) => (
                              <span
                                key={i}
                                className="text-xs px-3 py-1.5 glass border border-black/5 dark:border-white/5"
                              >
                                {hub}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-mute mb-2 flex items-center gap-2">
                          <Users size={14} /> Employees
                        </p>
                        {(courier.employees || []).length > 0 ? (
                          <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-xs uppercase text-slate-mute border-b border-black/10 dark:border-white/10">
                                  <th className="py-2 pr-4">Name</th>
                                  <th className="py-2 pr-4">Phone</th>
                                  <th className="py-2">Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courier.employees.map((emp, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-black/5 dark:border-white/5 last:border-0"
                                  >
                                    <td className="py-2 pr-4">{emp.name}</td>
                                    <td className="py-2 pr-4 text-slate-mute">{emp.phone || '—'}</td>
                                    <td className="py-2">
                                      <span className="text-xs px-2 py-0.5 bg-gold/15 text-gold">
                                        {emp.role || 'Rider'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-mute mb-4">No employees yet</p>
                        )}
                        <div className="glass p-4 grid sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="text-xs text-slate-mute block mb-1">Name *</label>
                            <input
                              type="text"
                              value={empForm.name}
                              onChange={(e) =>
                                setEmployeeForm(courier._id, { name: e.target.value })
                              }
                              className="input-field w-full"
                              placeholder="Ahmed Khan"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-mute block mb-1">Phone</label>
                            <input
                              type="text"
                              value={empForm.phone}
                              onChange={(e) =>
                                setEmployeeForm(courier._id, { phone: e.target.value })
                              }
                              className="input-field w-full"
                              placeholder="+92 300..."
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-mute block mb-1">Role</label>
                            <select
                              value={empForm.role}
                              onChange={(e) =>
                                setEmployeeForm(courier._id, { role: e.target.value })
                              }
                              className="input-field w-full"
                            >
                              <option value="Rider">Rider</option>
                              <option value="Driver">Driver</option>
                              <option value="Hub Manager">Hub Manager</option>
                              <option value="Dispatcher">Dispatcher</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddEmployee(courier._id)}
                            disabled={submitting === `emp-${courier._id}`}
                            className="btn-primary text-sm"
                          >
                            {submitting === `emp-${courier._id}` ? 'Adding...' : 'Add Employee'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-mute mb-2 flex items-center gap-2">
                          <Car size={14} /> Vehicles
                        </p>
                        {(courier.vehicles || []).length > 0 ? (
                          <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-xs uppercase text-slate-mute border-b border-black/10 dark:border-white/10">
                                  <th className="py-2 pr-4">Type</th>
                                  <th className="py-2 pr-4">Number</th>
                                  <th className="py-2">Model</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courier.vehicles.map((veh, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-black/5 dark:border-white/5 last:border-0"
                                  >
                                    <td className="py-2 pr-4">{veh.type || '—'}</td>
                                    <td className="py-2 pr-4 font-mono text-xs">{veh.number}</td>
                                    <td className="py-2 text-slate-mute">{veh.model || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-mute mb-4">No vehicles yet</p>
                        )}
                        <div className="glass p-4 grid sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="text-xs text-slate-mute block mb-1">Type</label>
                            <select
                              value={vehForm.type}
                              onChange={(e) =>
                                setVehicleForm(courier._id, { type: e.target.value })
                              }
                              className="input-field w-full"
                            >
                              <option value="Bike">Bike</option>
                              <option value="Car">Car</option>
                              <option value="Van">Van</option>
                              <option value="Truck">Truck</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-mute block mb-1">Number *</label>
                            <input
                              type="text"
                              value={vehForm.number}
                              onChange={(e) =>
                                setVehicleForm(courier._id, { number: e.target.value })
                              }
                              className="input-field w-full"
                              placeholder="LEA-1234"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-mute block mb-1">Model</label>
                            <input
                              type="text"
                              value={vehForm.model}
                              onChange={(e) =>
                                setVehicleForm(courier._id, { model: e.target.value })
                              }
                              className="input-field w-full"
                              placeholder="Honda 125"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddVehicle(courier._id)}
                            disabled={submitting === `veh-${courier._id}`}
                            className="btn-primary text-sm"
                          >
                            {submitting === `veh-${courier._id}` ? 'Adding...' : 'Add Vehicle'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {inactiveCouriers.length > 0 && (
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02]">
                <p className="text-xs uppercase tracking-wider text-slate-mute mb-3">
                  Inactive Couriers
                </p>
                <div className="space-y-2">
                  {inactiveCouriers.map((courier) => (
                    <div
                      key={courier._id}
                      className="flex items-center gap-3 p-3 glass opacity-60"
                    >
                      <Truck size={16} className="text-slate-mute" />
                      <span>{courier.name}</span>
                      <span className="text-xs font-mono text-slate-mute">{courier.code}</span>
                      <span className="text-xs px-2 py-0.5 bg-red-500/15 text-red-500 ml-auto">
                        Inactive
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCouriers;
