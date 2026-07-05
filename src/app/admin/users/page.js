'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, updateUserCredits } from '@/app/actions/users';
import { Search, UserCog, Coins, Star, Loader2, Save, X } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ credits: 0, featuredCredits: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getAllUsers();
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      credits: user.credits,
      featuredCredits: user.featuredCredits
    });
  };

  const handleSaveCredits = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateUserCredits(editingUser.id, editForm);
    if (res.success) {
      alert('Créditos actualizados correctamente');
      setEditingUser(null);
      loadUsers();
    } else {
      alert(res.error || 'Error al actualizar');
    }
    setSaving(false);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por email o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 p-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Usuario</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold text-center">Créditos</th>
                <th className="p-4 font-semibold text-center">Destacados</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted-foreground">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted-foreground">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{user.name || 'Sin nombre'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">Registrado: {new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-500'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-foreground">
                      <div className="flex items-center justify-center">
                        <Coins size={16} className="text-primary mr-1" />
                        {user.credits}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-foreground">
                      <div className="flex items-center justify-center">
                        <Star size={16} className="text-purple-500 mr-1" />
                        {user.featuredCredits}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="inline-flex items-center px-3 py-1.5 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors text-foreground"
                      >
                        <UserCog size={16} className="mr-2 text-primary" />
                        Editar Créditos
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDICION */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Editar Créditos de Usuario</h2>
              <button onClick={() => setEditingUser(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCredits} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Usuario: <strong className="text-foreground">{editingUser.email}</strong>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center"><Coins size={16} className="mr-1 text-primary"/> Créditos Normales</div>
                    </label>
                    <input 
                      type="number" min="0" required
                      value={editForm.credits}
                      onChange={(e) => setEditForm({...editForm, credits: parseInt(e.target.value) || 0})}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      <div className="flex items-center"><Star size={16} className="mr-1 text-purple-500"/> Créditos Destacados</div>
                    </label>
                    <input 
                      type="number" min="0" required
                      value={editForm.featuredCredits}
                      onChange={(e) => setEditForm({...editForm, featuredCredits: parseInt(e.target.value) || 0})}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-background border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={saving}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium flex items-center transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
