import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './EmployeeHistory.css';
import { FaHome } from 'react-icons/fa';

const EmployeeHistory = () => {
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem("employeeUsername");
        const employeeId = localStorage.getItem("employeeId");
        const token = localStorage.getItem("token");

        if (storedUsername && employeeId && token) {
            fetchEmployeeDetails(storedUsername);
        } else {
            navigate("/employee-login");
        }
    }, [navigate]);

    const fetchEmployeeDetails = async (username) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/employee/get-employee-details/${username}`);
            const data = await response.json();

            if (response.ok) {
                setEmployeeDetails(data);
                fetchEmployeeHistory(data); // Fetch history after getting employee details
            } else {
                Swal.fire("Error", data.message || "Failed to fetch details.", "error");
            }
        } catch (error) {
            console.error("Error fetching employee details:", error);
            Swal.fire("Error", "An error occurred while fetching employee details.", "error");
        }
    };

    const fetchEmployeeHistory = async (employeeData) => {
        try {
            const historyResponse = await fetch(`http://localhost:5000/sql/employee/employee-bus-schedule-history`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: employeeData.employee_username,
                    job_type: employeeData.job_type,
                    bus_stand: employeeData.bus_stand,
                }),
            });

            const historyData = await historyResponse.json();

            if (historyResponse.ok) {
                setHistory(historyData);
            } else {
                Swal.fire("Error", historyData.message || "Failed to fetch history.", "error");
            }
        } catch (error) {
            console.error("Error fetching employee history:", error);
            Swal.fire("Error", "An error occurred while fetching history.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading employee history...</p>;
    }

    const navigateDashboard = () => {
        navigate("/dashboard");
    };
    return (
        <div className="oeh-employee-history-container">
            <div className="oeh-home-icon" onClick={navigateDashboard}>
                <FaHome size={30} />
            </div>
            <h1>Employee History</h1>
            {history.length > 0 ? (
                <div className="oeh-history-grid">
                    {history.map((item) => (
                        <div key={item.id} className="oeh-history-card">
                            <h3>{item.source_address} ➔ {item.destination_address}</h3>
                            <p><strong>Bus Number:</strong> {item.bus_number}</p>
                            <p><strong>Driver:</strong> {item.driver}</p>
                            <p><strong>Conductor:</strong> {item.conductor}</p>
                            <p><strong>Door Attendant:</strong> {item.door_attendant}</p>
                            <p><strong>Starting Time:</strong> {new Date(item.starting_time).toLocaleString()}</p>
                            <p><strong>Ending Time:</strong> {new Date(item.ending_time).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No history available for this employee.</p>
            )}
        </div>
    );
};

export default EmployeeHistory;
