import axios from 'axios';
import React, { useEffect, useState } from 'react';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'client'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Errore nel caricamento degli utenti');
      setLoading(false);
    }
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/users',
        newUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setUsers([...users, response.data]);
      setNewUser({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'client'
      });
    } catch (error) {
      setError('Errore nella creazione dell\'utente');
    }
  };

  const handleUpdateUser = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${id}`,
        editingUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setUsers(users.map(user =>
        user._id === id ? response.data : user
      ));
      setEditingUser(null);
    } catch (error) {
      setError('Errore nell\'aggiornamento dell\'utente');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo utente?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      setError('Errore nell\'eliminazione dell\'utente');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--accent)]">
        Gestione Utenti
      </h2>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded">
          {error}
        </div>
      )}

      {/* Form nuovo utente */}
      <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Aggiungi Nuovo Utente</h3>
        <form onSubmit={handleNewUserSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
              required
            />
            <input
              type="text"
              placeholder="Nome"
              value={newUser.firstName}
              onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
              className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
              required
            />
            <input
              type="text"
              placeholder="Cognome"
              value={newUser.lastName}
              onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
              className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
              required
            />
            <input
              type="tel"
              placeholder="Telefono"
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
              required
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
            >
              <option value="client">Cliente</option>
              <option value="admin">Amministratore</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-[var(--accent)] text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            Aggiungi Utente
          </button>
        </form>
      </div>

      {/* Lista utenti */}
      <div className="grid gap-4">
        {users.map(user => (
          <div
            key={user._id}
            className="bg-[var(--bg-secondary)] p-4 rounded-lg flex justify-between items-center"
          >
            {editingUser?.id === user._id ? (
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      firstName: e.target.value
                    })}
                    className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
                  />
                  <input
                    type="text"
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      lastName: e.target.value
                    })}
                    className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
                  />
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      phone: e.target.value
                    })}
                    className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
                  />
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      role: e.target.value
                    })}
                    className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
                  >
                    <option value="client">Cliente</option>
                    <option value="admin">Amministratore</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateUser(user._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Salva
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-bold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {user.email} • {user.phone}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                  } text-white`}>
                    {user.role === 'admin' ? 'Amministratore' : 'Cliente'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingUser({...user, id: user._id})}
                    className="text-[var(--accent)] hover:underline"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-500 hover:underline"
                  >
                    Elimina
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManager;
