import { useState, useEffect } from 'react';
import api from '../api';

export default function CreateTicketModal({ projectId, onClose, onCreated, sprints = [] }) {
    const [ticket, setTicket] = useState({
        title: '',
        description: '',
        priority: 1, // Medium
        type: 1, // Task
        storyPoints: 1,
        sprintId: '', // Empty = Backlog
        assigneeId: '' // Optional
    });

    // We could fetch users here to assign
    const [users, setUsers] = useState([]);
    const [epics, setEpics] = useState([]);

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
                <h2 style={{ marginBottom: '1.5rem' }}>Create Issue</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Title */}
                    <div>
                        <label>Summary *</label>
                        <input required className="input-field"
                            value={ticket.title} onChange={e => setTicket({ ...ticket, title: e.target.value })}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label>Description</label>
                        <textarea className="input-field" rows={4}
                            value={ticket.description} onChange={e => setTicket({ ...ticket, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Type */}
                        <div>
                            <label>Issue Type</label>
                            <select className="input-field"
                                value={ticket.type} onChange={e => setTicket({ ...ticket, type: parseInt(e.target.value) })}
                            >
                                <option value={0}>Story</option>
                                <option value={1}>Task</option>
                                <option value={2}>Bug</option>
                                <option value={3}>Epic</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label>Priority</label>
                            <select className="input-field"
                                value={ticket.priority} onChange={e => setTicket({ ...ticket, priority: parseInt(e.target.value) })}
                            >
                                <option value={0}>Low</option>
                                <option value={1}>Medium</option>
                                <option value={2}>High</option>
                                <option value={3}>Critical</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Sprint */}
                        <div>
                            <label>Sprint</label>
                            <select className="input-field"
                                value={ticket.sprintId} onChange={e => setTicket({ ...ticket, sprintId: e.target.value })}
                            >
                                <option value="">Backlog (No Sprint)</option>
                                {sprints.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
                                ))}
                            </select>
                        </div>

                        {/* Story Points */}
                        <div>
                            <label>Story Points</label>
                            <input type="number" className="input-field"
                                value={ticket.storyPoints} onChange={e => setTicket({ ...ticket, storyPoints: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Assignee */}
                    <div>
                        <label>Assignee</label>
                        <select className="input-field"
                            value={ticket.assigneeId || ''} onChange={e => setTicket({ ...ticket, assigneeId: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.fullName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Epic Link */}
                    <div>
                        <label>Epic Link (Optional)</label>
                        <select className="input-field"
                            value={ticket.parentId || ''} onChange={e => setTicket({ ...ticket, parentId: e.target.value || null })}
                        >
                            <option value="">No Epic</option>
                            {epics.map(epic => (
                                <option key={epic.id} value={epic.id}>{epic.title}</option>
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
