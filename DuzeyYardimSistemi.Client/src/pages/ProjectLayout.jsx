import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function ProjectLayout() {
    const { projectId } = useParams();
    const location = useLocation();
    const { t } = useApp();
    const [project, setProject] = useState(null);

    useEffect(() => {
        api.get(`/project/${projectId}`).then(res => setProject(res.data));
    }, [projectId]);

    if (!project) return <div style={{ padding: '2rem', color: 'var(--text-main)' }}>{t('loading')}</div>;

    return (
        <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
            {/* Project Header */}
            <div style={{
                padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '4px', background: 'var(--primary-color)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold'
                }}>
                    {project.key.substring(0, 1)}
                </div>
                <div>
                    <h2 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)' }}>{project.name}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.key}</span>
                </div>
            </div>

            {/* Project content with sidebar */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <nav style={{
                    width: '200px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)', padding: '1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem'
                }}>
                    <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t('activeBoard')}
                        </span>
                    </div>
                    <NavLink to={`/project/${projectId}/board`} label={t('board')} active={location.pathname.includes('/board')} />
                    <NavLink to={`/project/${projectId}/backlog`} label={t('backlog')} active={location.pathname.includes('/backlog')} />
                    <NavLink to={`/project/${projectId}/reports`} label={t('reports')} active={location.pathname.includes('/reports')} />
                </nav>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-main)' }}>
                    <Outlet context={{ project }} />
                </div>
            </div>
        </div>
    );
}

function NavLink({ to, label, active }) {
    return (
        <Link to={to} style={{
            display: 'block', padding: '0.5rem 0.75rem', borderRadius: '6px',
            background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: active ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: active ? '600' : '400',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
        }}>
            {label}
        </Link>
    );
}
