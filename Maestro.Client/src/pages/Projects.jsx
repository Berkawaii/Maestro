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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Projects</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    New Project
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {projects.map((p) => (
                    <Link to={`/project/${p.id}/backlog`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }}>
                            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{p.name}</h3>
                                <span style={{
                                    background: p.type === 0 ? '#e0e7ff' : '#fce7f3',
                                    color: p.type === 0 ? '#4338ca' : '#be185d',
                                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    {p.type === 0 ? 'AGILE' : 'HELP DESK'}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {p.key}
                            </p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{p.description || 'No description'}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
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
        </div>
    );
}
