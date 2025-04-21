import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [scheduleInfo, setScheduleInfo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const employeeId = localStorage.getItem("employeeId");
        const username = localStorage.getItem("employeeUsername");
        const token = localStorage.getItem("token");

        if (employeeId && token && username) {
            fetch(`http://localhost:5000/sql/employee/get-employee-details/${username}`)
                .then((response) => response.json())
                .then((data) => {
                    setEmployeeInfo({
                        employeeId: employeeId,
                        username: username,
                        jobType: data.job_type,
                        busStand: data.bus_stand,
                    });
                })
                .catch((error) => {
                    console.error("Error fetching employee details:", error);
                    Swal.fire("Error", "Failed to fetch employee details.", "error");
                });
        } else {
            navigate("/employee-login");
        }
    }, [navigate]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to logout?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            localStorage.removeItem("employeeId");
            localStorage.removeItem("employeeUsername");
            localStorage.removeItem("token");
            navigate("/employee-login");
            Swal.fire('Logged out!', 'You have been logged out.', 'success');
        } else {
            Swal.fire('Cancelled', 'You are still logged in.', 'info');
        }
    };

    const handleCheckRoute = async () => {
        setIsModalOpen(true);
        try {
            const response = await fetch(`http://localhost:5000/sql/employee/employee-bus-schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: employeeInfo.username,
                    job_type: employeeInfo.jobType,
                    bus_stand: employeeInfo.busStand,
                }),
            });

            const data = await response.json();

            if (response.status === 200) {
                setScheduleInfo(data);
            } else {
                Swal.fire("Error", data.message, "error");
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
            Swal.fire("Error", "Failed to fetch schedule.", "error");
        }
    };

    return (
        <div className="ed-employee-dashboard-container">
            {employeeInfo ? (
                <div>
                    <div className="ed-e-header">
                        <h2>Welcome, {employeeInfo.username}!</h2>
                        <p>Job Type: {employeeInfo.jobType}</p>
                        <p>Bus Stand: {employeeInfo.busStand}</p>
                        <p>Your Employee ID: {employeeInfo.employeeId}</p>
                    </div>

                    <div className="ed-grid-container">
                        <div className="ed-grid-item" style={{ backgroundColor: "#74e7f7" }} onClick={handleCheckRoute}>
                            <h3>Check Route</h3>
                        </div>
                        <div className="ed-grid-item" style={{ backgroundColor: "#FFDDC1" }} onClick={() => navigate('/employee-history')}>
                            <h3>Your History</h3>
                        </div>

                        <div className="ed-grid-item" style={{ backgroundColor: "#FFC3A0" }} onClick={handleLogout}>
                            <h3>Logout</h3>
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h2 className="schedule-title">Bus Schedule</h2>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>

                                {scheduleInfo ? (
                                    <div className="schedule-details">
                                        <div className="schedule-card">
                                            <p className="ed-route-popup"><strong>{scheduleInfo.source_address} &#8594; {scheduleInfo.destination_address}</strong> </p>
                                            <p><strong>Bus Number:</strong> {scheduleInfo.bus_number}</p>
                                            <p><strong>Driver:</strong> {scheduleInfo.driver}</p>
                                            <p><strong>Conductor:</strong> {scheduleInfo.conductor}</p>
                                            <p><strong>Door Attendant:</strong> {scheduleInfo.door_attendant}</p>
                                            <p><strong>Starting Time:</strong> {new Date(scheduleInfo.starting_time).toLocaleString()}</p>
                                            <p><strong>Ending Time:</strong> {new Date(scheduleInfo.ending_time).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Loading schedule...</p>
                                )}
                            </div>
                        </div>
                    )}


                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default EmployeeDashboard;
