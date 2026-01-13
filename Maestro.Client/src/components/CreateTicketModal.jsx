import { useState, useEffect } from 'react';
import api from '../api';

export default function CreateTicketModal({ projectId, onClose, onCreated, sprints = [], mode = 'project' }) {
    // mode: 'project' (Story, Task, Bug) vs 'helpdesk' (Request, Incident)

    const [ticket, setTicket] = useState({
        title: '',
        description: '',
        priority: 1, // Medium
        type: mode === 'project' ? 1 : 1, // Default Task (1) or Request (1) - matching enum values if possible?
        // Let's assume:
        // Project: 0=Story, 1=Task, 2=Bug, 3=Epic
        // Help Desk: 1=Request, 2=Incident (reusing Type enum or need mapping?)
        // The user said "Istek / Talep" vs "Hata / Arıza" mixed with Story/Task.
        // Current Backend Enum: Story=0, Task=1, Bug=2, Epic=3.
        // Let's use Task(1) for Request and Bug(2) for Incident for Help Desk mode for now.

        storyPoints: mode === 'project' ? 1 : null,
        sprintId: '', // Empty = Backlog
        assigneeId: '' // Optional
    });

    // We could fetch users here to assign
    const [users, setUsers] = useState([]);
    const [epics, setEpics] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        // Fetch Departments
        api.get('/department').then(res => setDepartments(res.data)).catch(err => console.error(err));

        // Fetch Users (for assignee)
        api.get('/user').then(res => setUsers(res.data)).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (projectId) {
            api.get(`/ticket?projectId=${projectId}`)
                .then(res => {
                    if (Array.isArray(res.data)) {
                        const epicList = res.data.filter(x => x.type === 3);
                        setEpics(epicList);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...ticket,
                projectId: parseInt(projectId),
                sprintId: ticket.sprintId ? parseInt(ticket.sprintId) : null,
                storyPoints: ticket.storyPoints ? parseInt(ticket.storyPoints) : null,
                parentId: ticket.parentId ? parseInt(ticket.parentId) : null
            };

            await api.post('/ticket', payload);
            onCreated();
        } catch (err) {
            console.error(err);
            alert('Failed to create ticket');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>
                    {mode === 'project' ? 'Create Project Issue' : 'New Support Ticket'}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Title */}
                    <div>
                        <label>Konu / Özet *</label>
                        <input required className="input-field"
                            value={ticket.title} onChange={e => setTicket({ ...ticket, title: e.target.value })}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label>Açıklama</label>
                        <textarea className="input-field" rows={4}
                            value={ticket.description} onChange={e => setTicket({ ...ticket, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Type */}
                        <div>
                            <label>Talep Tipi</label>
                            <select className="input-field"
                                value={ticket.type} onChange={e => setTicket({ ...ticket, type: parseInt(e.target.value) })}
                            >
                                {mode === 'project' ? (
                                    <>
                                        <option value={0}>Story</option>
                                        <option value={1}>Task</option>
                                        <option value={2}>Bug</option>
                                        <option value={3}>Epic</option>
                                    </>
                                ) : (
                                    <>
                                        <option value={1}>İstek / Talep (Task)</option>
                                        <option value={2}>Hata / Arıza (Bug)</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label>Öncelik</label>
                            <select className="input-field"
                                value={ticket.priority} onChange={e => setTicket({ ...ticket, priority: parseInt(e.target.value) })}
                            >
                                <option value={0}>Düşük</option>
                                <option value={1}>Orta</option>
                                <option value={2}>Yüksek</option>
                                <option value={3}>Kritik</option>
                            </select>
                        </div>
                    </div>

                    {mode === 'project' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Story Points */}
                            <div>
                                <label>Story Points</label>
                                <input type="number" className="input-field"
                                    value={ticket.storyPoints || ''} onChange={e => setTicket({ ...ticket, storyPoints: e.target.value })}
                                />
                            </div>

                            {/* Epic Link */}
                            <div>
                                <label>Epic Link</label>
                                <select className="input-field"
                                    value={ticket.parentId || ''} onChange={e => setTicket({ ...ticket, parentId: e.target.value })}
                                >
                                    <option value="">None</option>
                                    {epics.map(e => <option key={e.id} value={e.id}>{e.ticketKey} - {e.title}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Category - Only for HelpDesk */}
                    {mode === 'helpdesk' && (
                        <div>
                            <label>Kategori (Destek Alanı)</label>
                            <select className="input-field"
                                value={ticket.category || ''} onChange={e => setTicket({ ...ticket, category: e.target.value })}
                            >
                                <option value="">Seçiniz...</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Assignee */}
                    <div>
                        <label>Atanan Kişi (Opsiyonel)</label>
                        <select className="input-field"
                            value={ticket.assigneeId || ''} onChange={e => setTicket({ ...ticket, assigneeId: e.target.value })}
                        >
                            <option value="">Atanmadı</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                        <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
