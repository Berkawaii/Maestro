import { useState, useEffect } from 'react';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function TicketDetailModal({ ticketId, onClose, onUpdate }) {
    const { t } = useApp();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [epics, setEpics] = useState([]);
    const [members, setMembers] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (ticketId) {
            setLoading(true);
            setError(null);

            // Fetch ticket
            api.get(`/ticket/${ticketId}`)
                .then(res => {
                    setTicket(res.data);
                    setLoading(false);
                    // Fetch statuses
                    api.get(`/ticketstatus?projectId=${res.data.projectId}`).then(s => setStatuses(s.data));
                    // Fetch epics
                    api.get(`/ticket?projectId=${res.data.projectId}`).then(t => {
                        const epicList = t.data.filter(x => x.type === 3 && x.id !== ticketId);
                        setEpics(epicList);
                    });
                    // Fetch members
                    api.get(`/project/${res.data.projectId}/members`).then(m => setMembers(m.data)).catch(e => console.error(e));
                    // Fetch comments
                    api.get(`/ticket/${ticketId}/comments`).then(c => setComments(c.data)).catch(e => console.error(e));
                })
                .catch(err => {
                    console.error(err);
                    setError("Failed to load ticket details.");
                    setLoading(false);
                });
        }
    }, [ticketId]);

    const handleSave = async (updates) => {
        try {
            await api.patch(`/ticket/${ticketId}`, updates);
            setTicket({ ...ticket, ...updates });
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/ticket/${ticketId}/comments`, { content: newComment });
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error(err);
            alert('Failed to add comment');
        }
    };

    if (!ticketId) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div className="card" style={{
                width: '900px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header Actions */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{ticket ? `${ticket.projectKey}-${ticket.id}` : t('loading')}</span>
                        {ticket && ticket.parentTitle && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                {ticket.parentTitle}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                </div>

                {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}
                {error && <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>}

                {!loading && !error && ticket && (
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Main Content */}
                        <div style={{ flex: 2, padding: '2rem', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
                            <input
                                className="input-field"
                                style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '100%', border: 'none', marginBottom: '1rem', outline: 'none', background: 'transparent', color: 'var(--text-main)' }}
                                value={ticket.title}
                                onChange={e => setTicket({ ...ticket, title: e.target.value })}
                                onBlur={e => handleSave({ title: ticket.title })}
                            />

                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('description')}</h4>
                            <textarea
                                className="input-field"
                                style={{ width: '100%', minHeight: '150px', resize: 'vertical', marginBottom: '2rem' }}
                                value={ticket.description || ''}
                                onChange={e => setTicket({ ...ticket, description: e.target.value })}
                                onBlur={e => handleSave({ description: ticket.description })}
                                placeholder={t('description') + '...'}
                            />

                            {/* Comments Section */}
                            <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>{t('comments')}</h4>

                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {comments.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet.</p>
                                    ) : (
                                        comments.map(c => (
                                            <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-sidebar)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                                                    {c.userName ? c.userName.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.userName}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem' }}>
                                        Me
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <textarea
                                            className="input-field"
                                            placeholder="Add a comment..."
                                            style={{ width: '100%', minHeight: '80px', resize: 'vertical', marginBottom: '0.5rem' }}
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                        >
                                            {t('save')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div style={{ flex: 1, padding: '1.5rem', background: 'var(--bg-sidebar)', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>{t('status')}</label>
                                <select
                                    className="input-field"
                                    value={ticket.statusId || ''}
                                    onChange={e => handleSave({ statusId: parseInt(e.target.value) })}
                                >
                                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>{t('assignee')}</label>
                                <select
                                    className="input-field"
                                    value={ticket.assigneeId || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setTicket({ ...ticket, assigneeId: val });
                                        handleSave({ assigneeId: val });
                                    }}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>{t('storyPoints')}</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={ticket.storyPoints || ''}
                                    onChange={e => handleSave({ storyPoints: parseInt(e.target.value) })}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>{t('priority')}</label>
                                <select className="input-field" value={ticket.priority} onChange={e => handleSave({ priority: parseInt(e.target.value) })}>
                                    <option value={0}>Low</option>
                                    <option value={1}>Medium</option>
                                    <option value={2}>High</option>
                                    <option value={3}>Critical</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
