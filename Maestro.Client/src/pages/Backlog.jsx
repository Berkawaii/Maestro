import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, useDraggable, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import api from '../api';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';
import EditSprintModal from '../components/EditSprintModal';
import { useApp } from '../context/AppContext';

export default function Backlog() {
    const { projectId } = useParams();
    const { t } = useApp();
    const [sprints, setSprints] = useState([]);
    const [backlogTickets, setBacklogTickets] = useState([]);
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [activeDragId, setActiveDragId] = useState(null);
    const [draggedTicket, setDraggedTicket] = useState(null);
    const [editingSprint, setEditingSprint] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        try {
            const sprintsRes = await api.get(`/sprint?projectId=${projectId}`);
            const ticketsRes = await api.get(`/ticket?projectId=${projectId}`);

            const allTickets = ticketsRes.data;
            const bTickets = allTickets.filter(t => !t.sprintId);

            const sprintData = sprintsRes.data.map(s => {
                const sTickets = allTickets.filter(t => t.sprintId === s.id);
                return { ...s, tickets: sTickets };
            });

            setSprints(sprintData);
            setBacklogTickets(bTickets);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateSprint = async () => {
        try {
            const name = `Sprint ${sprints.length + 1}`;
            await api.post('/sprint', {
                name,
                projectId: parseInt(projectId),
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            });
            fetchData();
            // Optional: alert(t('sprintSuccess'));
        } catch (err) {
            alert('Failed to create sprint');
        }
    };

    const handleStartSprint = async (sprintId) => {
        try {
            await api.put(`/sprint/${sprintId}/start`, {
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || t('sprintStartFail'));
        }
    };

    const handleCompleteSprint = async (sprintId) => {
        if (!confirm(t('sprintCompleteConfirm'))) return;
        try {
            await api.put(`/sprint/${sprintId}/complete`, {});
            fetchData();
        } catch (err) {
            alert('Failed to complete sprint');
        }
    };

    const onDragStart = (event) => {
        setActiveDragId(event.active.id);
        const ticketId = parseInt(event.active.id.replace('ticket-', ''));

        let ticket = backlogTickets.find(t => t.id === ticketId);
        if (!ticket) {
            sprints.forEach(s => {
                const found = s.tickets.find(t => t.id === ticketId);
                if (found) ticket = found;
            });
        }
        setDraggedTicket(ticket);
    };

    const onDragEnd = async (event) => {
        const { active, over } = event;
        setActiveDragId(null);
        setDraggedTicket(null);

        if (!over) return;
        if (active.id === over.id) return;

        const ticketId = parseInt(active.id.replace('ticket-', ''));
        const containerId = over.id;

        let newSprintId = null;
        if (containerId !== 'backlog') {
            newSprintId = parseInt(containerId.replace('sprint-', ''));
        }

        const allTickets = [...backlogTickets, ...sprints.flatMap(s => s.tickets)];
        let ticket = allTickets.find(t => t.id === ticketId);

        if (!ticket) return;
        if (ticket.sprintId === newSprintId) return;

        const newBacklog = backlogTickets.filter(t => t.id !== ticketId);
        const newSprints = sprints.map(s => ({ ...s, tickets: s.tickets.filter(t => t.id !== ticketId) }));

        ticket = { ...ticket, sprintId: newSprintId };

        if (newSprintId === null) {
            setBacklogTickets([...newBacklog, ticket]);
            setSprints(newSprints);
        } else {
            setBacklogTickets(newBacklog);
            setSprints(newSprints.map(s => {
                if (s.id === newSprintId) {
                    return { ...s, tickets: [...s.tickets, ticket] };
                }
                return s;
            }));
        }

        try {
            await api.patch(`/ticket/${ticketId}`, { sprintId: newSprintId || 0 });
        } catch (err) {
            console.error("Failed to move ticket", err);
            fetchData();
        }
    };

    return (
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('backlog')}</h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Sprints */}
                    {sprints.filter(s => !s.isCompleted).map(sprint => (
                        <SprintContainer
                            key={sprint.id}
                            sprint={sprint}
                            onStart={() => handleStartSprint(sprint.id)}
                            onComplete={() => handleCompleteSprint(sprint.id)}
                            onEdit={() => setEditingSprint(sprint)}
                            onTicketClick={setSelectedTicketId}
                            t={t}
                        />
                    ))}

                    {/* Create Sprint Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontWeight: '600', color: 'var(--text-main)' }} onClick={handleCreateSprint}>
                            {t('createSprint')}
                        </button>
                    </div>

                    {/* Backlog Container */}
                    <BacklogContainer
                        tickets={backlogTickets}
                        onTicketClick={setSelectedTicketId}
                        onCreateTicket={() => setShowCreateTicket(true)}
                        t={t}
                    />

                </div>

                <DragOverlay>
                    {draggedTicket ? <TicketItem ticket={draggedTicket} isOverlay /> : null}
                </DragOverlay>

                {showCreateTicket && (
                    <CreateTicketModal
                        projectId={projectId}
                        sprints={sprints}
                        mode="project"
                        onClose={() => setShowCreateTicket(false)}
                        onCreated={() => { setShowCreateTicket(false); fetchData(); }}
                    />
                )}

                {selectedTicketId && (
                    <TicketDetailModal
                        ticketId={selectedTicketId}
                        onClose={() => setSelectedTicketId(null)}
                        onUpdate={() => fetchData()}
                    />
                )}

                {editingSprint && (
                    <EditSprintModal
                        sprint={editingSprint}
                        onClose={() => setEditingSprint(null)}
                        onUpdate={() => { setEditingSprint(null); fetchData(); }}
                    />
                )}
            </div>
        </DndContext>
    );
}

// ---------------------------
// Sub-Components
// ---------------------------

function SprintContainer({ sprint, onStart, onComplete, onEdit, onTicketClick, t }) {
    const { setNodeRef } = useDroppable({ id: `sprint-${sprint.id}` });

    return (
        <div className="card" style={{ padding: '0', background: 'var(--bg-main)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            {/* Header */}
            <div style={{
                padding: '1rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{sprint.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {sprint.tickets.length} {t('issues')}
                    </span>
                    {sprint.goal && <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>{sprint.goal}</span>}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* Actions */}
                    {!sprint.isActive ? (
                        <button className="btn" onClick={onStart} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                            {t('startSprint')}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                {t('active')}
                            </span>
                            <button className="btn" onClick={onComplete} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                                {t('completeSprint')}
                            </button>
                        </div>
                    )}
                    <button className="btn" onClick={onEdit} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                        {t('editSprint')}
                    </button>
                </div>
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} style={{ minHeight: '60px', padding: '0.5rem', background: 'var(--bg-main)' }}>
                {sprint.tickets.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {t('planSprint')}
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {sprint.tickets.map(t => <DraggableTicket key={t.id} ticket={t} onClick={() => onTicketClick(t.id)} />)}
                </div>
            </div>
        </div>
    );
}

function BacklogContainer({ tickets, onTicketClick, onCreateTicket, t }) {
    const { setNodeRef } = useDroppable({ id: 'backlog' });

    return (
        <div className="card" style={{ padding: '0', background: 'var(--bg-card)' }}>
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{t('backlog')}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tickets.length} {t('issues')}</span>
            </div>

            <div ref={setNodeRef} style={{ minHeight: '100px', padding: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {tickets.map(t => <DraggableTicket key={t.id} ticket={t} onClick={() => onTicketClick(t.id)} />)}
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <button
                        onClick={onCreateTicket}
                        style={{
                            width: '100%', padding: '0.5rem', textAlign: 'left', background: 'none', border: 'none',
                            color: 'var(--text-main)', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>+</span> {t('createIssue')}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DraggableTicket({ ticket, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `ticket-${ticket.id}` });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.3 : 1, zIndex: isDragging ? 999 : 'auto' } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <TicketItem ticket={ticket} onClick={onClick} />
        </div>
    );
}

function TicketItem({ ticket, onClick, isOverlay }) {
    const typeIcons = { 0: 'STORY', 1: 'TASK', 2: 'BUG', 3: 'EPIC' };
    const typeColors = { 0: '#4f46e5', 1: '#10b981', 2: '#ef4444', 3: '#8b5cf6' };

    return (
        <div
            onClick={onClick}
            style={{
                padding: '0.5rem 1rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: isOverlay ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
                border: isOverlay ? '1px solid var(--primary-color)' : 'none',
                borderRadius: isOverlay ? '4px' : '0'
            }}
            className="ticket-hover"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: typeColors[ticket.type], background: typeColors[ticket.type] + '15', padding: '2px 4px', borderRadius: '3px', width: '40px', textAlign: 'center' }}>
                    {typeIcons[ticket.type]}
                </span>
                {ticket.parentTitle && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#6366f1', background: '#e0e7ff', padding: '2px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                        {ticket.parentTitle}
                    </span>
                )}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                    {ticket.title}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {ticket.projectKey}-{ticket.id}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-main)', padding: '1px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                    {ticket.statusName}
                </span>
                {ticket.storyPoints && (
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-main)', width: '20px', height: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        {ticket.storyPoints}
                    </span>
                )}
                {ticket.assigneeName && (
                    <div style={{ width: '24px', height: '24px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {ticket.assigneeName.charAt(0)}
                    </div>
                )}
            </div>
        </div>
    );
}
