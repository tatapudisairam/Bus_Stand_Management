import React, { useEffect, useState } from 'react';
import './CheckRouteForAnEmployee.css';
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Check = () => {
    const [busStandName, setBusStandName] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);
    const [noAssignment, setNoAssignment] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const adminId = localStorage.getItem("adminId");
        const adminUsername = localStorage.getItem("username");

        if (!adminId || !adminUsername) {
            console.log('Admin is not signed in. Redirecting to login page...');
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
        setRouteDetails(null);
        setNoAssignment(false);

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

    const handleCheck = async () => {
        if (!selectedEmployee || !employeeDetails) {
            alert('Please select an employee!');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/sql/bus-schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: selectedEmployee,
                    job_type: employeeDetails.job_type,
                    bus_stand: busStandName
                })
            });

            const data = await response.json();
            if (response.ok && data) {
                setRouteDetails(data);
                setNoAssignment(false);
            } else {
                setRouteDetails(null);
                setNoAssignment(true);
            }
        } catch (error) {
            console.error('Error fetching route details:', error);
            alert('An error occurred while fetching route details.');
        }
    };

    return (
        <div className="cra-main-container">
            <div className="cra-home-icon" onClick={() => navigate('/dashboard')}>
                <FaHome size={30} />
            </div>
            <div className="cra-container">
                <h1>Check Route for an Employee</h1>

                <div className="cra-search-container">
                    <div className="cra-select-container">
                        <select
                            value={selectedEmployee}
                            onChange={handleEmployeeChange}
                            className="cra-select"
                        >
                            <option value="">Select an Employee</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.employee_username}>
                                    {emp.employee_username}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleCheck} className="cra-check-btn">
                            Check
                        </button>
                    </div>
                </div>

                {noAssignment && (
                    <div className="cra-no-assignment">
                        <h2>No Assignment Found</h2>
                        <p>It seems this employee doesn't have any assigned routes currently.</p>
                    </div>
                )}

                {routeDetails && !noAssignment && (
                    <div className="cra-route-details">
                        <h2>🛣️ Journey Details</h2>
                        <div className="cra-route-info">
                            <p><strong>From:</strong> {routeDetails.source_address}</p>
                            <p><strong>To:</strong> {routeDetails.destination_address}</p>
                            <p><strong>Bus Number:</strong> {routeDetails.bus_number}</p>
                            <p><strong>Start Time:</strong> {new Date(routeDetails.starting_time).toLocaleString()}</p>
                            <p><strong>End Time:</strong> {new Date(routeDetails.ending_time).toLocaleString()}</p>
                            <p><strong>Driver:</strong> {routeDetails.driver}</p>
                            <p><strong>Conductor:</strong> {routeDetails.conductor}</p>
                            <p><strong>Door Attendant:</strong> {routeDetails.door_attendant}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Check;
