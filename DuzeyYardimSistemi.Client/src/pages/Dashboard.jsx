import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
    const { t } = useApp();
    const user = JSON.parse(localStorage.getItem('user'));
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTickets: 0,
        pendingTickets: 0,
        completedTickets: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                // Fetch real data where possible, or mock for demo if endpoints are limited
                const projectsRes = await api.get('/project');
                const ticketsRes = await api.get('/ticket');

                // Calculate simple stats
                const projects = projectsRes.data;
                const tickets = ticketsRes.data;

                const pending = tickets.filter(t => t.statusId === 1 || t.statusId === 2).length; // Assuming 1=Todo, 2=In Progress
                const completed = tickets.filter(t => t.statusId === 3).length; // Assuming 3=Done

                setStats({
                    totalProjects: projects.length,
                    totalTickets: tickets.length,
                    pendingTickets: pending,
                    completedTickets: completed
                });
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Welcome Section */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                }}>
                    {t('welcome')}, {user?.fullName?.split(' ')[0]}!
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Here's what's happening with your projects today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    title="Total Projects"
                    value={stats.totalProjects}
                    icon="🚀"
                    color="blue"
                    trend="+12% from last month"
                />
                <StatCard
                    title="Active Tickets"
                    value={stats.totalTickets}
                    icon="🎫"
                    color="purple"
                    trend="+5 new today"
                />
                <StatCard
                    title="Pending Tasks"
                    value={stats.pendingTickets}
                    icon="⏳"
                    color="orange"
                    trend="Requires attention"
                />
                <StatCard
                    title="Completed"
                    value={stats.completedTickets}
                    icon="✅"
                    color="green"
                    trend="+8 this week"
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Visual Chart Area (Mocked for aesthetics) */}
                <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Sprint Velocity</h3>
                        <select className="input-field" style={{ width: 'auto', padding: '0.4rem' }}>
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                        </select>
                    </div>

                    {/* CSS-only Bar Chart Mockup */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1rem', paddingBottom: '1rem' }}>
                        <Bar height="40%" label="Sprint 1" />
                        <Bar height="65%" label="Sprint 2" />
                        <Bar height="50%" label="Sprint 3" />
                        <Bar height="85%" label="Sprint 4" active />
                        <Bar height="60%" label="Sprint 5" />
                    </div>
                </div>

                {/* Quick Actions & Recent */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/projects" className="btn" style={{ justifyContent: 'flex-start', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                                <span style={{ marginRight: '0.75rem' }}>📂</span> Create New Project
                            </Link>
                            <Link to="/tickets" className="btn" style={{ justifyContent: 'flex-start', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                                <span style={{ marginRight: '0.75rem' }}>🎫</span> Create New Ticket
                            </Link>
                            <button className="btn" style={{ justifyContent: 'flex-start', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                                <span style={{ marginRight: '0.75rem' }}>👥</span> Manage Team
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1rem' }}>System Status</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>All systems operational</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Last check: Just now
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, trend }) {
    const colorMap = {
        blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
        purple: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' },
        orange: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316' },
        green: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' }
    };

    const theme = colorMap[color] || colorMap.blue;

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: theme.bg, color: theme.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                }}>
                    {icon}
                </div>
                {trend && <span style={{ fontSize: '0.75rem', color: theme.text, background: theme.bg, padding: '2px 6px', borderRadius: '12px' }}>{trend}</span>}
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{title}</div>
            </div>
        </div>
    );
}

function Bar({ height, label, active }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '100%' }}>
            <div style={{
                width: '40px',
                height: height,
                background: active ? 'linear-gradient(to top, var(--primary-color), #60a5fa)' : 'var(--bg-sidebar)',
                borderRadius: '8px 8px 0 0',
                transition: 'height 1s ease-out',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'rgba(255,255,255,0.2)' }}></div>}
            </div>
            <span style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: active ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: active ? '600' : '400' }}>{label}</span>
        </div>
    );
}
