import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import api from '../api';
import TicketDetailModal from '../components/TicketDetailModal';
import { useApp } from '../context/AppContext';

// Icons
const SearchIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const FilterIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>;

export default function Board() {
    const { projectId } = useParams();
    const { t } = useApp();
    const [activeSprint, setActiveSprint] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [activeDragId, setActiveDragId] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState(''); // Assignee Name
    const [users, setUsers] = useState([]); // Unique assignees from tickets

    // Sensors for Drag and Drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchBoardData();
    }, [projectId]);

    const fetchBoardData = async () => {
        try {
            const sprintsRes = await api.get(`/sprint?projectId=${projectId}`);
            const active = sprintsRes.data.find(s => s.isActive);
            setActiveSprint(active);

            const statusRes = await api.get(`/ticketstatus?projectId=${projectId}`);
            if (statusRes.data.length === 0) {
                setStatuses([{ id: 1, name: 'To Do' }, { id: 2, name: 'In Progress' }, { id: 3, name: 'Done' }]);
            } else {
                setStatuses(statusRes.data.sort((a, b) => a.order - b.order));
            }

            if (active) {
                const ticketRes = await api.get(`/ticket?projectId=${projectId}`);
                const sprintTickets = ticketRes.data.filter(t => t.sprintId === active.id);
                setTickets(sprintTickets);

                // Extract unique assignees
                const uniqueUsers = [...new Set(sprintTickets.map(t => t.assigneeName).filter(Boolean))];
                setUsers(uniqueUsers);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (over && active.id !== over.id) {
            const newStatusId = parseInt(over.id);
            const oldTickets = [...tickets];
            setTickets(tickets.map(t =>
                t.id === active.id ? { ...t, statusId: newStatusId } : t
            ));

            try {
                await api.patch(`/ticket/${active.id}`, { statusId: newStatusId });
            } catch (err) {
                console.error("Failed to update status", err);
                setTickets(oldTickets);
            }
        }
    };

    // Filter Logic
    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.projectKey + '-' + t.id).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUser = userFilter ? t.assigneeName === userFilter : true;
        return matchesSearch && matchesUser;
    });

    if (!activeSprint) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h2>No Active Sprint</h2>
                <p>Go to the Backlog to start a sprint.</p>
            </div>
        );
    }

    const draggedTicket = tickets.find(t => t.id === activeDragId);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{activeSprint.name}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{activeSprint.goal}</p>
                    </div>

                    {/* Filter Bar */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                            <SearchIcon />
                            <input
                                placeholder="Search this board"
                                style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-main)' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                            <FilterIcon />
                            <select
                                style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-main)' }}
                                value={userFilter}
                                onChange={e => setUserFilter(e.target.value)}
                            >
                                <option value="">All Assignees</option>
                                {users.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', height: '100%', paddingBottom: '1rem' }}>
                    {statuses.map(status => (
                        <BoardColumn
                            key={status.id}
                            status={status}
                            tickets={filteredTickets.filter(t => t.statusId === status.id)}
                            onTicketClick={setSelectedTicket}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {draggedTicket ? <TicketCard ticket={draggedTicket} isOverlay /> : null}
            </DragOverlay>

            {selectedTicket && (
                <TicketDetailModal
                    ticketId={selectedTicket.id}
                    onClose={() => setSelectedTicket(null)}
                    onUpdate={() => { fetchBoardData(); }}
                />
            )}
        </DndContext>
    );
}

function BoardColumn({ status, tickets, onTicketClick }) {
    const { setNodeRef } = useDroppable({ id: status.id.toString() });

    return (
        <div ref={setNodeRef} style={{
            flex: '0 0 280px', background: 'var(--bg-main)', borderRadius: '6px',
            display: 'flex', flexDirection: 'column', maxHeight: '100%',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                {status.name}
                <span style={{ background: 'var(--bg-card)', padding: '0 8px', borderRadius: '10px', fontSize: '0.7rem', border: '1px solid var(--border-color)' }}>
                    {tickets.length}
                </span>
            </div>

            <div style={{ padding: '0 0.5rem 0.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tickets.map(ticket => (
                    <DraggableTicket key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} />
                ))}
            </div>
        </div>
    );
}

function DraggableTicket({ ticket, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ticket.id });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <TicketCard ticket={ticket} onClick={onClick} />
        </div>
    );
}

function TicketCard({ ticket, onClick, isOverlay }) {
    const priorityColors = { 0: '#10b981', 1: '#f59e0b', 2: '#ef4444', 3: '#b91c1c' }; // Low, Med, High, Crit

    return (
        <div onClick={onClick} className="card" style={{
            padding: '0.75rem', cursor: 'grab',
            backgroundColor: 'var(--bg-card)',
            boxShadow: isOverlay ? 'var(--shadow-lg)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
            transform: isOverlay ? 'scale(1.05) rotate(2deg)' : 'none',
            border: isOverlay ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-main)'
        }}>
            {/* Title */}
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.4' }}>
                {ticket.title}
            </div>

            {/* Epic Tag */}
            {ticket.parentTitle && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 'bold',
                        color: 'white', background: '#7c3aed', // Purple background from screenshot
                        padding: '2px 6px', borderRadius: '3px',
                        textTransform: 'uppercase'
                    }}>
                        {ticket.parentTitle}
                    </span>
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Key */}
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-color)' }}>{ticket.projectKey}-{ticket.id}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Story Points */}
                    {ticket.storyPoints && (
                        <span style={{
                            fontSize: '0.75rem', background: 'var(--bg-main)', color: 'var(--text-muted)',
                            padding: '1px 6px', borderRadius: '4px', fontWeight: '600'
                        }}>
                            {ticket.storyPoints}
                        </span>
                    )}

                    {/* Priority Indicator */}
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: priorityColors[ticket.priority] }} title="Priority"></div>

                    {/* Assignee Avatar */}
                    {ticket.assigneeName ? (
                        <div style={{ width: '24px', height: '24px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--bg-card)' }} title={ticket.assigneeName}>
                            {ticket.assigneeName.charAt(0)}
                        </div>
                    ) : (
                        <div style={{ width: '24px', height: '24px', background: 'var(--bg-main)', borderRadius: '50%', border: '1px solid var(--border-color)' }}></div>
                    )}
                </div>
            </div>
        </div>
    );
}
