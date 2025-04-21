import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeHistory.css';
import { FaHome } from 'react-icons/fa';

const EmployeeHistory = () => {
    const [busStandName, setBusStandName] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [employeeDetails, setEmployeeDetails] = useState(null);
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
                fetchEmployees(data.bus_stand_name);
            } else {
                alert('Admin details not found!');
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
            alert('An error occurred while fetching admin details.');
        }
    };

    const fetchEmployees = async (busStand) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/all-employees-by-bus-stand/${busStand}`);
            const data = await response.json();
            if (response.ok) {
                setEmployees(data);
            } else {
                alert('No employees found!');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            alert('An error occurred while fetching employee details.');
        }
    };

    const handleEmployeeChange = async (e) => {
        const username = e.target.value;
        setSelectedEmployee(username);
        setEmployeeDetails(null);
        setHistory([]);
        setFilteredHistory([]);
        setFilterOption('All');
        setCustomStartDate('');
        setCustomEndDate('');

        try {
            const response = await fetch(`http://localhost:5000/sql/employee/${username}`);
            const data = await response.json();
            if (response.ok) {
                setEmployeeDetails(data);
            } else {
                alert('Employee details not found!');
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            alert('An error occurred while fetching employee details.');
        }
    };

    const handleDisplayHistory = async () => {
        if (!selectedEmployee || !employeeDetails) {
            setErrorMessage('Please select an employee and ensure details are loaded.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/sql/bus-schedule-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: selectedEmployee,
                    job_type: employeeDetails.job_type,
                    bus_stand: busStandName
                })
            });

            const data = await response.json();
            if (response.ok) {
                setHistory(data);
                setFilteredHistory(data);
                setErrorMessage('');
            } else {
                setHistory([]);
                setFilteredHistory([]);
                setErrorMessage('No history found for this employee.');
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
        <div className="aes-employee-history-container">
            <div className='aes-employee-inner-container'>
                <div>
                    <h1 className="aes-header">Employee History at {busStandName || 'Loading...'}</h1>

                    <div className="aes-employee-selection">
                        <label>Select an Employee:</label>
                        <select value={selectedEmployee} onChange={handleEmployeeChange}>
                            <option value="">-- Select Employee --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.employee_username}>
                                    {emp.employee_username}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleDisplayHistory} className="aes-display-button">Display</button>
                    </div>
                </div>
                <div className="aes-home-icon" onClick={navigateDashboard}>
                    <FaHome size={30} />
                </div>
            </div>


            {errorMessage && <p className="aes-error-message">{errorMessage}</p>}

            {history.length > 0 && (
                <div className="aes-filter-options">
                    {[
                        { label: 'All', icon: 'fa-solid fa-list' },
                        { label: 'Last Week', icon: 'fa-solid fa-calendar-week' },
                        { label: 'Last Month', icon: 'fa-solid fa-calendar-alt' },
                        { label: 'Custom', icon: 'fa-solid fa-calendar' }
                    ].map(({ label, icon }) => (
                        <span
                            key={label}
                            onClick={() => handleFilterChange(label)}
                            className={`aes-filter-text ${filterOption === label ? 'aes-active-filter' : ''}`}
                        >
                            <i className={`${icon} aes-filter-icon`}></i> {label}
                        </span>
                    ))}
                </div>
            )}

            {filterOption === 'Custom' && (
                <div className="aes-custom-filter">
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
                    <button onClick={handleCustomFilter} className="aes-apply-filter-button">
                        Apply
                    </button>
                </div>
            )}

            {filteredHistory.length > 0 && (
                <div className="aes-history-container">
                    <div className="aes-history-grid">
                        {filteredHistory.map((schedule) => (
                            <div key={schedule.id} className="aes-history-card">
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

export default EmployeeHistory;
