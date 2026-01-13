import { useState, useEffect } from 'react';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function SlaSettings() {
    const { t } = useApp();
    const [config, setConfig] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [configRes, policiesRes] = await Promise.all([
                api.get('/sla/config'),
                api.get('/sla/policies')
            ]);
            setConfig(configRes.data);
            setPolicies(policiesRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        try {
            await api.post('/sla/config', config);
            alert('Settings saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        }
    };

    const handleSavePolicies = async () => {
        try {
            await api.put('/sla/policies', policies);
            alert('Policies saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save policies');
        }
    };

    const priorityNames = { 0: 'Low', 1: 'Medium', 2: 'High', 3: 'Critical' };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>{t('slaSettings')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Working Hours */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>{t('workingHours')}</h2>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('startTime')} (HH:mm:ss)</label>
                        <input className="input-field"
                            value={config.startTime}
                            onChange={e => setConfig({ ...config, startTime: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('endTime')} (HH:mm:ss)</label>
                        <input className="input-field"
                            value={config.endTime}
                            onChange={e => setConfig({ ...config, endTime: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('workingDays')}</label>
                        <input className="input-field"
                            value={config.workDays}
                            onChange={e => setConfig({ ...config, workDays: e.target.value })}
                            placeholder="Monday,Tuesday..."
                        />
                    </div>

                    <button className="btn btn-primary" onClick={handleSaveConfig} style={{ marginTop: '1rem' }}>{t('saveSettings')}</button>
                </div>

                {/* Policies */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>{t('responseTargets')}</h2>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <th style={{ padding: '0.5rem' }}>{t('priority')}</th>
                                <th style={{ padding: '0.5rem' }}>{t('maxTime')}</th>
                                <th style={{ padding: '0.5rem' }}>{t('estHours')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((p, index) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{priorityNames[p.priority]}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <input
                                            type="number"
                                            className="input-field"
                                            style={{ width: '100px' }}
                                            value={p.maxResolutionTimeMinutes}
                                            onChange={e => {
                                                const newPolicies = [...policies];
                                                newPolicies[index].maxResolutionTimeMinutes = parseInt(e.target.value);
                                                setPolicies(newPolicies);
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>
                                        {(p.maxResolutionTimeMinutes / 60).toFixed(1)} h
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button className="btn btn-primary" onClick={handleSavePolicies} style={{ marginTop: '2rem' }}>{t('updatePolicies')}</button>
                </div>

            </div>
        </div>
    );
}
