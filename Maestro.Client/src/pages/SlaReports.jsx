import { useState, useEffect } from 'react';
import api from '../api';
import { useApp } from '../context/AppContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function SlaReports() {
    const { t } = useApp();
    const [reportType, setReportType] = useState('monthly');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [reportType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/sla/report?type=${reportType}`);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const chartData = {
        labels: data.map(d => d.department),
        datasets: [
            {
                label: t('metSla'),
                data: data.map(d => d.metSla),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
            },
            {
                label: t('missedSla'),
                data: data.map(d => d.missedSla),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: t('slaComplianceByDept') },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true }
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('slaReports')}</h1>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['daily', 'weekly', 'monthly'].map(type => (
                        <button
                            key={type}
                            className="btn"
                            style={{
                                background: reportType === type ? 'var(--primary-color)' : 'var(--bg-card)',
                                color: reportType === type ? 'white' : 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                textTransform: 'capitalize'
                            }}
                            onClick={() => setReportType(type)}
                        >
                            {t(type)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div>{t('loading')}</div>
            ) : data.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('noResolvedTickets')}</div>
            ) : (
                <div className="card" style={{ height: '400px' }}>
                    <Bar options={options} data={chartData} />
                </div>
            )}

            {!loading && data.length > 0 && (
                <div className="card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>{t('department')}</th>
                                <th style={{ padding: '1rem' }}>{t('totalResolved')}</th>
                                <th style={{ padding: '1rem' }}>{t('totalImpacted')}</th>
                                <th style={{ padding: '1rem' }}>{t('metSla')}</th>
                                <th style={{ padding: '1rem' }}>{t('missedSla')}</th>
                                <th style={{ padding: '1rem' }}>{t('complianceRate')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{row.department}</td>
                                    <td style={{ padding: '1rem' }}>{row.totalResolved}</td>
                                    <td style={{ padding: '1rem' }}>{row.totalImpacted}</td>
                                    <td style={{ padding: '1rem', color: 'var(--success)' }}>{row.metSla}</td>
                                    <td style={{ padding: '1rem', color: 'var(--danger)' }}>{row.missedSla}</td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {row.complianceRate.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
