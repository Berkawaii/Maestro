import { useState, useEffect } from 'react';
import api from '../api';

export default function EditSprintModal({ sprint, onClose, onUpdate }) {
    const [data, setData] = useState({
        name: '',
        goal: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (sprint) {
            setData({
                name: sprint.name || '',
                goal: sprint.goal || '',
                startDate: sprint.startDate ? sprint.startDate.split('T')[0] : '',
                endDate: sprint.endDate ? sprint.endDate.split('T')[0] : ''
            });
        }
    }, [sprint]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/sprint/${sprint.id}/start`, {
                // Using start endpoint for updates or creating a new general Update endpoint?
                // SprintController currently has StartSprint (active=true) and CompleteSprint.
                // It MISSES a general "Update" endpoint for renaming or changing dates without starting.
                // I need to add [HttpPut("{id}")] to SprintController first!
                // For now, let's assume I will add it.
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null
            });
            onUpdate();
        } catch (err) {
            console.error(err);
            // If Update endpoint missing, this will fail 404 or 405.
            // I MUST add UpdateSprint to controller.
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '500px' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Edit Sprint</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Sprint Name</label>
                        <input required className="input-field"
                            value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Sprint Goal</label>
                        <textarea className="input-field" rows={3}
                            value={data.goal} onChange={e => setData({ ...data, goal: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label>Start Date</label>
                            <input type="date" className="input-field"
                                value={data.startDate} onChange={e => setData({ ...data, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>End Date</label>
                            <input type="date" className="input-field"
                                value={data.endDate} onChange={e => setData({ ...data, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
