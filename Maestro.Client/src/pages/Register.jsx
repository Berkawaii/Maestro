import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useApp } from '../context/AppContext';
import logo from '../assets/logo.png';

export default function Register() {
    const navigate = useNavigate();
    const { t } = useApp(); // Ideally add translations for register later
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', { fullName, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decor */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px',
                background: 'var(--primary-color)', opacity: '0.2', filter: 'blur(100px)', borderRadius: '50%'
            }}></div>
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px',
                background: '#7c3aed', opacity: '0.15', filter: 'blur(120px)', borderRadius: '50%'
            }}></div>




            <div className="card" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '3rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                margin: '1rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img src={logo} alt="Maestro Logo" style={{
                        width: '80px', height: '80px', margin: '0 auto 1rem auto', display: 'block',
                        filter: 'drop-shadow(0 10px 15px rgba(59, 130, 246, 0.3))'
                    }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                        Create Account
                    </h2>
                    <p style={{ color: '#94a3b8' }}>Join Maestro to manage projects efficiently</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem',
                        fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500' }}>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="John Doe"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                                color: 'white', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                                color: 'white', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                                color: 'white', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '0.5rem', padding: '0.85rem', width: '100%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white', border: 'none', borderRadius: '8px',
                            fontWeight: '600', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1, transition: 'transform 0.1s',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Get Started'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
