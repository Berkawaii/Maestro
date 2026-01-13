import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', key: '', type: 0, description: '' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectMembers, setProjectMembers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/project');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/project', newProject);
            setShowModal(false);
            setNewProject({ name: '', key: '', type: 0, description: '' });
            fetchProjects();
        } catch (err) {
            alert('Failed to create project');
        }
    };

    const handleDeleteProject = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project? ALL tickets will be lost!')) return;
        try {
            await api.delete(`/project/${id}`);
            fetchProjects();
        } catch (err) {
            alert('Failed to delete project');
        }
    };

    const openMemberModal = async (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProject(project);

        try {
            // Fetch project members
            const membersRes = await api.get(`/project/${project.id}/members`);
            setProjectMembers(membersRes.data);

            // Fetch all users to populate add list
            const usersRes = await api.get('/user');
            setAllUsers(usersRes.data);

            setShowMemberModal(true);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch members');
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await api.post(`/project/${selectedProject.id}/members`, { userId });
            const res = await api.get(`/project/${selectedProject.id}/members`);
            setProjectMembers(res.data);
        } catch (err) {
            alert('Failed to add member');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await api.delete(`/project/${selectedProject.id}/members/${userId}`);
            setProjectMembers(projectMembers.filter(m => m.id !== userId));
        } catch (err) {
            alert('Failed to remove member');
        }
    };

    // User check for admin controls
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isAdmin = currentUser?.roles?.includes('Admin') || currentUser?.roles?.includes('SupportAdmin');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Projects</h1>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Create Project
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {projects.map((p) => (
                    <Link to={`/project/${p.id}/backlog`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%', position: 'relative' }}>
                            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{p.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{
                                        background: p.type === 0 ? '#e0e7ff' : '#fce7f3',
                                        color: p.type === 0 ? '#4338ca' : '#be185d',
                                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        {p.type === 0 ? 'AGILE' : 'HELP DESK'}
                                    </span>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {p.key}
                            </p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem' }}>{p.description || 'No description'}</p>

                            {isAdmin && (
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button
                                        className="btn"
                                        style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                                        onClick={(e) => openMemberModal(e, p)}
                                    >
                                        Members
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', color: '#ef4444' }}
                                        onClick={(e) => handleDeleteProject(e, p.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Create Project Modal */}
            {showModal && (
                <div style={modalStyle}>
                    <div className="card" style={{ width: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create Project</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label>Name</label>
                                <input required className="input-field"
                                    value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Key</label>
                                <input required className="input-field" maxLength={5}
                                    value={newProject.key} onChange={e => setNewProject({ ...newProject, key: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Type</label>
                                <select className="input-field"
                                    value={newProject.type} onChange={e => setNewProject({ ...newProject, type: parseInt(e.target.value) })}
                                >
                                    <option value={0}>Agile</option>
                                    <option value={1}>Help Desk</option>
                                </select>
                            </div>
                            <div>
                                <label>Description</label>
                                <textarea className="input-field" rows={3}
                                    value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */}
            {showMemberModal && selectedProject && (
                <div style={modalStyle}>
                    <div className="card" style={{ width: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Manage Members: {selectedProject.name}</h2>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <select
                                className="input-field"
                                onChange={(e) => {
                                    if (e.target.value) handleAddMember(e.target.value);
                                    e.target.value = "";
                                }}
                            >
                                <option value="">+ Add User to Project</option>
                                {allUsers
                                    .filter(u => !projectMembers.some(m => m.id === u.id))
                                    .map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                    ))}
                            </select>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectMembers.map(m => (
                                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.5rem' }}>{m.fullName}</td>
                                            <td style={{ padding: '0.5rem' }}>{m.email}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '0.2rem 0.5rem', color: '#ef4444', fontSize: '0.8rem' }}
                                                    onClick={() => handleRemoveMember(m.id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button className="btn" onClick={() => setShowMemberModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
};
