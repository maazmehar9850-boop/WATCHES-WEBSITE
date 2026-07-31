import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Shield, ShieldOff } from 'lucide-react';
import api from '../../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    api
      .get('/users')
      .then((r) => setUsers(r.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (user) => {
    if (user.role === 'admin') {
      toast.error('Cannot block admin users');
      return;
    }
    setToggling(user._id);
    try {
      const res = await api.put(`/users/${user._id}/block`);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data.user : u)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl mb-1">Users</h1>
        <p className="text-slate-mute text-sm">Manage registered users</p>
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-mute">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-slate-mute">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wider uppercase text-slate-mute border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-gold/[0.03]"
                  >
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-slate-mute">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs tracking-wider uppercase px-2 py-1 ${
                          user.role === 'admin'
                            ? 'bg-gold/20 text-gold'
                            : 'bg-black/5 dark:bg-white/10 text-slate-mute'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.isBlocked ? (
                        <span className="text-xs text-red-500">Blocked</span>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="text-xs text-slate-mute">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleBlock(user)}
                          disabled={toggling === user._id}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs border transition-colors ${
                            user.isBlocked
                              ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                              : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {user.isBlocked ? (
                            <>
                              <Shield size={14} /> Unblock
                            </>
                          ) : (
                            <>
                              <ShieldOff size={14} /> Block
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
