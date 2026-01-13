import { useState, useEffect } from 'react';
import api from '../api';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [newDept, setNewDept] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/department');
            setDepartments(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newDept.trim()) return;

        try {
            await api.post('/department', { name: newDept });
            setNewDept('');
            fetchDepartments();
        } catch (err) {
            console.error(err);
            alert('Failed to create department');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            await api.delete(`/department/${id}`);
            fetchDepartments();
        } catch (err) {
            console.error(err);
            alert('Failed to delete department');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '2rem' }}>Department / Category Management</h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Create New Department</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        className="input-field"
                        placeholder="Department Name (e.g. SAP SD, Network)"
                        value={newDept}
                        onChange={e => setNewDept(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Department Name</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={2} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : departments.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{d.name}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button className="btn" style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }} onClick={() => handleDelete(d.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!loading && departments.length === 0 && (
                            <tr><td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No departments found. Add one above.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
