import { useState, useEffect } from 'react';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function Users() {
    const { t } = useApp();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ role: '', department: '' });

    // Mock data for categories/departments - REPLACED WITH DYNAMIC
    const [departments, setDepartments] = useState([]);
    const ROLES = ["Admin", "Support", "SupportAdmin", "User"];

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/department');
            setDepartments(res.data.map(d => d.name));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/user');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpdateUser = async (id, data) => {
        try {
            await api.put(`/user/${id}`, data);
            fetchUsers(); // Refresh
            alert("User updated successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to update user");
        }
    };

    const filteredUsers = users.filter(u => {
        const userRoles = u.roles || u.Roles || [];
        const userDept = u.department || u.Department;

        if (filters.role && !userRoles.includes(filters.role)) return false;
        if (filters.department && userDept !== filters.department) return false;
        return true;
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>User Management</h1>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select className="input-field" onChange={e => setFilters({ ...filters, role: e.target.value })}>
                        <option value="">All Roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select className="input-field" onChange={e => setFilters({ ...filters, department: e.target.value })}>
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredUsers.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                departments={departments}
                                onUpdate={handleUpdateUser}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UserRow({ user, departments, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const userRoles = user.roles || user.Roles || [];
    const userDept = user.department || user.Department || '';

    const [formData, setFormData] = useState({
        department: userDept,
        role: userRoles[0] || 'User'
    });

    const handleSave = () => {
        onUpdate(user.id, {
            department: formData.department,
            roles: [formData.role] // Send as array
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{user.userName}</td>
                <td style={{ padding: '1rem' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                    <select
                        className="input-field"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        style={{ padding: '0.25rem' }}
                    >
                        <option value="User">User</option>
                        <option value="Support">Support</option>
                        <option value="SupportAdmin">SupportAdmin</option>
                        <option value="Admin">Admin</option>
                    </select>
                </td>
                <td style={{ padding: '1rem' }}>
                    <select
                        className="input-field"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        style={{ padding: '0.25rem' }}
                    >
                        <option value="">None</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }} onClick={handleSave}>Save</button>
                    <button className="btn" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setIsEditing(false)}>Cancel</button>
                </td>
            </tr>
        );
    }

    return (
        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 'bold' }}>{user.firstName || user.FirstName} {user.lastName || user.LastName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{user.userName || user.UserName}</div>
            </td>
            <td style={{ padding: '1rem' }}>{user.email || user.Email}</td>
            <td style={{ padding: '1rem' }}>
                {userRoles.map(r => (
                    <span key={r} style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        background: r === 'Admin' ? '#fee2e2' : r === 'Support' ? '#dbeafe' : '#f3f4f6',
                        color: r === 'Admin' ? '#991b1b' : r === 'Support' ? '#1e40af' : '#374151',
                        fontSize: '0.8rem',
                        marginRight: '0.25rem'
                    }}>{r}</span>
                ))}
            </td>
            <td style={{ padding: '1rem' }}>{user.department || '-'}</td>
            <td style={{ padding: '1rem', textAlign: 'right' }}>
                <button className="btn" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setIsEditing(true)}>Edit</button>
            </td>
        </tr>
    );
}
