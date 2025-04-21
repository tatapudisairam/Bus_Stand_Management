import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntireHistory.css'; // Reusing styles for consistency
import { FaHome } from 'react-icons/fa';

const EntireHistory = () => {
    const [busStandName, setBusStandName] = useState('');
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [filterOption, setFilterOption] = useState('All');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const navigate = useNavigate();
    const adminUsername = localStorage.getItem('username');

    useEffect(() => {
        const adminId = localStorage.getItem('adminId');
        if (!adminId || !adminUsername) {
            navigate('/');
        } else {
            fetchAdminDetails(adminUsername);
        }
    }, [navigate]);

    const fetchAdminDetails = async (username) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/get-admin-details/${username}`);
            const data = await response.json();
            if (response.ok) {
                setBusStandName(data.bus_stand_name);
                fetchHistory(data.bus_stand_name);
            } else {
                alert('Admin details not found!');
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
            alert('An error occurred while fetching admin details.');
        }
    };

    const fetchHistory = async (busStand) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/bus-schedules-by-bus-stand/${busStand}`);
            const data = await response.json();
            if (response.ok) {
                setHistory(data);
                setFilteredHistory(data);
                setErrorMessage('');
            } else {
                setHistory([]);
                setFilteredHistory([]);
                setErrorMessage('No history found for this bus stand.');
            }
        } catch (error) {
            console.error('Error fetching bus schedule history:', error);
            setErrorMessage('An error occurred while fetching history.');
        }
    };

    const handleFilterChange = (filter) => {
        setFilterOption(filter);
        setCustomStartDate('');
        setCustomEndDate('');

        const now = new Date();
        let filteredData = [...history];

        switch (filter) {
            case 'Last Week':
                filteredData = history.filter(item => {
                    const itemDate = new Date(item.starting_time);
                    return now - itemDate <= 7 * 24 * 60 * 60 * 1000;
                });
                break;
            case 'Last Month':
                filteredData = history.filter(item => {
                    const itemDate = new Date(item.starting_time);
                    return now - itemDate <= 30 * 24 * 60 * 60 * 1000;
                });
                break;
            case 'Custom':
                break;
            default:
                filteredData = history;
        }

        setFilteredHistory(filteredData);
    };

    const handleCustomFilter = () => {
        if (!customStartDate || !customEndDate) {
            alert('Please select both start and end dates.');
            return;
        }

        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);

        const filteredData = history.filter(item => {
            const itemDate = new Date(item.starting_time);
            return itemDate >= startDate && itemDate <= endDate;
        });

        setFilteredHistory(filteredData);
    };

    const navigateDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="eh-employee-history-container">
            <div className='eh-employee-inner-container'>
                <h1 className="eh-header">Bus Schedules History at {busStandName || 'Loading...'}</h1>
                <div className="eh-home-icon" onClick={navigateDashboard}>
                    <FaHome size={30} />
                </div>
            </div>

            {errorMessage && <p className="eh-error-message">{errorMessage}</p>}

            {history.length > 0 && (
                <div className="eh-filter-options">
                    {[
                        { label: 'All', icon: 'fa-solid fa-list' },
                        { label: 'Last Week', icon: 'fa-solid fa-calendar-week' },
                        { label: 'Last Month', icon: 'fa-solid fa-calendar-alt' },
                        { label: 'Custom', icon: 'fa-solid fa-calendar' }
                    ].map(({ label, icon }) => (
                        <span
                            key={label}
                            onClick={() => handleFilterChange(label)}
                            className={`eh-filter-text ${filterOption === label ? 'eh-active-filter' : ''}`}
                        >
                            <i className={`${icon} eh-filter-icon`}></i> {label}
                        </span>
                    ))}
                </div>
            )}

            {filterOption === 'Custom' && (
                <div className="eh-custom-filter">
                    <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                    <button onClick={handleCustomFilter} className="eh-apply-filter-button">
                        Apply
                    </button>
                </div>
            )}

            {filteredHistory.length > 0 && (
                <div className="eh-history-container">
                    <div className="eh-history-grid">
                        {filteredHistory.map((schedule) => (
                            <div key={schedule.id} className="eh-history-card">
                                <h3>Bus Number: {schedule.bus_number}</h3>
                                <p><strong>From:</strong> {schedule.source_address}</p>
                                <p><strong>To:</strong> {schedule.destination_address}</p>
                                <p><strong>Start Time:</strong> {new Date(schedule.starting_time).toLocaleString()}</p>
                                <p><strong>End Time:</strong> {new Date(schedule.ending_time).toLocaleString()}</p>
                                <p><strong>Driver:</strong> {schedule.driver}</p>
                                <p><strong>Conductor:</strong> {schedule.conductor}</p>
                                <p><strong>Door Attendant:</strong> {schedule.door_attendant}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntireHistory;
