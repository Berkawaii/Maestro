import { useState, useEffect } from 'react';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function Roles() {
    const { t } = useApp();
    const [roles, setRoles] = useState([]);
    const [newRole, setNewRole] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/role');
            setRoles(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!newRole.trim()) return;

        try {
            await api.post('/role', { name: newRole });
            setNewRole('');
            fetchRoles();
        } catch (err) {
            console.error(err);
            alert('Failed to create role');
        }
    };

    const handleDeleteRole = async (roleName) => {
        if (!confirm(`Are you sure you want to delete role: ${roleName}?`)) return;

        try {
            await api.delete(`/role/${roleName}`);
            fetchRoles();
        } catch (err) {
            console.error(err);
            alert('Failed to delete role. System roles cannot be deleted.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '2rem' }}>Role Management</h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Create New Role</h3>
                <form onSubmit={handleAddRole} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        className="input-field"
                        placeholder="Role Name (e.g. HR_Manager)"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Add Role</button>
                </form>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Role Name</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={2} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : roles.map(role => (
                            <tr key={role} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{role}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {['Admin', 'User', 'Support', 'SupportAdmin'].includes(role) ? (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>System Role</span>
                                    ) : (
                                        <button className="btn" style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }} onClick={() => handleDeleteRole(role)}>Delete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
