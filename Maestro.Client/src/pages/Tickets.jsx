import { useState, useEffect } from 'react';
import api from '../api';
import { useApp } from '../context/AppContext';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';

export default function Tickets() {
    const { t } = useApp();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchTickets();
        api.get('/department').then(res => setDepartments(res.data)).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        filterTickets();
    }, [tickets, search, categoryFilter, statusFilter]);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/ticket'); // Role logic is handled by backend
            setTickets(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filterTickets = () => {
        let temp = [...tickets];

        if (search) {
            const lowerIds = search.toLowerCase();
            temp = temp.filter(t =>
                t.title.toLowerCase().includes(lowerIds) ||
                t.ticketKey?.toLowerCase().includes(lowerIds) ||
                t.description?.toLowerCase().includes(lowerIds)
            );
        }

        if (categoryFilter) {
            temp = temp.filter(t => t.category === categoryFilter);
        }

        if (statusFilter) {
            temp = temp.filter(t => t.statusName === statusFilter);
        }

        setFilteredTickets(temp);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this ticket?')) return;

        try {
            await api.delete(`/ticket/${id}`);
            setTickets(tickets.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete ticket. You might not have permission.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('tickets')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and support requests</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + {t('createTicket')}
                </button>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                    className="input-field"
                    placeholder="Search tickets..."
                    style={{ flex: 1, minWidth: '200px' }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="input-field" style={{ width: 'auto' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                </select>
                <select className="input-field" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>

            {/* Ticket List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Key</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Reporter</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Assignee</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Created</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredTickets.length === 0 ? (
                            <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tickets found.</td></tr>
                        ) : filteredTickets.map(ticket => (
                            <tr
                                key={ticket.id}
                                style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{ticket.projectKey}-{ticket.id}</td>
                                <td style={{ padding: '1rem' }}>{ticket.title}</td>
                                <td style={{ padding: '1rem' }}>
                                    {ticket.category ? (
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontSize: '0.8rem' }}>
                                            {ticket.category}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>{ticket.reporterName}</td>
                                <td style={{ padding: '1rem' }}>{ticket.assigneeName || 'Unassigned'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: ticket.statusName === 'Done' ? '#dcfce7' : ticket.statusName === 'In Progress' ? '#dbeafe' : '#f3f4f6',
                                        color: ticket.statusName === 'Done' ? '#166534' : ticket.statusName === 'In Progress' ? '#1e40af' : '#374151',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}>
                                        {ticket.statusName}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        className="btn"
                                        style={{ padding: '0.25rem 0.5rem', color: '#ef4444', border: 'none', background: 'transparent' }}
                                        onClick={(e) => handleDelete(e, ticket.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <CreateTicketModal
                    projectId={tickets[0]?.projectId || 1} // Fallback to 1 or make modal smarter
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchTickets();
                    }}
                />
            )}

            {selectedTicketId && (
                <TicketDetailModal
                    ticketId={selectedTicketId}
                    onClose={() => setSelectedTicketId(null)}
                    onUpdate={fetchTickets}
                />
            )}
        </div>
    );
}
