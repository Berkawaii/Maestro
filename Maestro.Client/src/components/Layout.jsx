import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import logo from '../assets/logo.png';

// Icons
const ChevronLeft = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const DashboardIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ProjectsIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const TicketsIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const UsersIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const RolesIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const DepartmentsIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const { theme, toggleTheme, language, toggleLanguage, t } = useApp();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            {/* Sidebar */}
            <aside style={{
                width: collapsed ? '80px' : '260px',
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 10,
                transition: 'width var(--transition-speed)',
                overflow: 'hidden'
            }}>


                {/* Logo Area */}
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                    <img src={logo} alt="Maestro Logo" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
                    {!collapsed && (
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
                            Maestro
                        </h2>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem', marginTop: '1rem' }}>
                    <NavItem to="/" icon={<DashboardIcon />} label={t('dashboard')} active={isActive('/')} collapsed={collapsed} />
                    <NavItem to="/projects" icon={<ProjectsIcon />} label={t('projects')} active={isActive('/projects')} collapsed={collapsed} />
                    <NavItem to="/tickets" icon={<TicketsIcon />} label={t('tickets')} active={isActive('/tickets')} collapsed={collapsed} />

                    {/* Admin Only */}
                    {(user?.roles?.includes('Admin') || user?.roles?.includes('SupportAdmin')) && (
                        <>
                            <NavItem to="/users" icon={<UsersIcon />} label={t('users')} active={isActive('/users')} collapsed={collapsed} />
                            <NavItem to="/departments" icon={<DepartmentsIcon />} label="Departments" active={isActive('/departments')} collapsed={collapsed} />
                        </>
                    )}
                </nav>

                {/* Sidebar Collapse Toggle (Bottom) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        margin: 'auto 1rem 1rem 1rem',
                        padding: '0.5rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>

                {/* User Profile */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: collapsed ? 'none' : 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.fullName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="btn" style={{
                        width: '100%', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)'
                    }}>
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, marginLeft: collapsed ? '80px' : '260px', display: 'flex', flexDirection: 'column', transition: 'margin-left var(--transition-speed)' }}>
                {/* Header / Topbar */}
                <header style={{
                    height: '64px',
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'var(--bg-main)', // Use solid background or transparency depending on preference. Using main bg for cleaner look.
                    borderBottom: '1px solid var(--border-color)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 5
                }}>
                    <div /> {/* Spacer for flex-between */}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={toggleLanguage} className="btn" style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.4rem 0.8rem', borderRadius: '8px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{language === 'tr' ? '🇹🇷' : '🇬🇧'}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{language.toUpperCase()}</span>
                        </button>
                        <button onClick={toggleTheme} className="btn" style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.4rem 0.8rem', borderRadius: '8px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{theme === 'light' ? '🌙' : '☀️'}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
                        </button>
                    </div>
                </header>

                <main style={{ padding: '2rem', flex: 1, overflowX: 'hidden' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label, active, collapsed }) {
    return (
        <Link to={to} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            color: active ? 'var(--primary-color)' : 'var(--text-muted)',
            background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            fontWeight: active ? '600' : '500',
            transition: 'all 0.2s',
            justifyContent: collapsed ? 'center' : 'flex-start',
            textDecoration: 'none'
        }}
            title={label}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'var(--bg-card)';
                    e.currentTarget.style.color = 'var(--text-main)';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                }
            }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
