import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function Reports() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState({
        totalTickets: 0,
        completedTickets: 0,
        ticketsByStatus: [],
        velocity: [] // Placeholder for sprint velocity
    });

    useEffect(() => {
        api.get(`/project/${projectId}`).then(res => setProject(res.data));

        // Fetch all tickets to calculate basic stats
        api.get(`/ticket?projectId=${projectId}`).then(res => {
            const tickets = res.data;
            const total = tickets.length;

            // This logic assumes specific IDs for Done, which might vary. 
            // Better to rely on "IsFinal" from statuses, but for now we'll do simple counting.

            // Group by Status
            const statusMap = {};
            tickets.forEach(t => {
                const sName = t.statusName || 'Unknown';
                statusMap[sName] = (statusMap[sName] || 0) + 1;
            });

            const statusArray = Object.keys(statusMap).map(key => ({ name: key, count: statusMap[key] }));

            setStats({
                totalTickets: total,
                completedTickets: 0, // Need IsFinal flag or specific status check
                ticketsByStatus: statusArray,
                velocity: [
                    { name: 'Sprint 1', points: 20 },
                    { name: 'Sprint 2', points: 25 },
                    { name: 'Sprint 3', points: 15 },
                ]
            });
        });

    }, [projectId]);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Reports: {project?.name}
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Summary Card */}
                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Project Overview
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.totalTickets}</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Issues</div>
                        </div>
                        <div>
                            {/* Placeholder logic for completion */}
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completedTickets}</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Completed</div>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Issue Status Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {stats.ticketsByStatus.map(s => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.9rem' }}>{s.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '60%' }}>
                                    <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(s.count / stats.totalTickets) * 100}%`, background: '#3b82f6', height: '100%' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', width: '20px', textAlign: 'right' }}>{s.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Velocity Chart Placeholder */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Sprint Velocity (Mock Data)
                    </h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '1rem' }}>
                        {stats.velocity.map(v => (
                            <div key={v.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '40px', height: `${v.points * 5}px`, background: '#8b5cf6', borderRadius: '4px 4px 0 0' }}></div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.name}</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{v.points} pts</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
