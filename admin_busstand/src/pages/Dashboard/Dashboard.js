import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './Dashboard.css';

const Dashboard = () => {
    const [adminInfo, setAdminInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const adminId = localStorage.getItem("adminId");
        const username = localStorage.getItem("username");

        if (adminId && username) {
            fetch(`http://localhost:5000/sql/get-admin-details/${username}`)
                .then((response) => response.json())
                .then((data) => {
                    setAdminInfo({
                        adminId: adminId,
                        username: username,
                        busStandName: data.bus_stand_name,
                    });
                })
                .catch((error) => {
                    console.error("Error fetching admin details:", error);
                    Swal.fire("Error", "Failed to fetch admin details.", "error");
                });
        } else {
            navigate("/");
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
            try {
                const response = await fetch('http://localhost:5000/auth/admin/logout', {
                    method: 'POST',
                    credentials: 'include',
                });

                const data = await response.json();

                if (response.status === 200) {
                    localStorage.removeItem("adminId");
                    localStorage.removeItem("username");
                    navigate("/");
                    Swal.fire('Logged out!', 'You have been logged out.', 'success');
                } else {
                    console.log("Logout failed:", data.message);
                }
            } catch (error) {
                console.error("Logout error:", error);
            }
        } else {
            Swal.fire('Cancelled', 'You are still logged in.', 'info');
        }
    };

    const handleGridClick = (route) => {
        navigate(route);
    };

    return (
        <div className="dashboard-container">
            {adminInfo ? (
                <div>
                    <div className="d-header">
                        <h2>Welcome, {adminInfo.username}!</h2>
                        <p>Bus Stand Name: {adminInfo.busStandName}</p>
                        <p>Your Admin ID is: {adminInfo.adminId}</p>
                    </div>

                    <div className="grid-container">
                        <div className="grid-item" style={{ backgroundColor: "#74e7f7" }} onClick={() => handleGridClick('/add-bus')}>
                            <h3>Add Bus</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#FFDDC1" }} onClick={() => handleGridClick('/create')}>
                            <h3>Create Employees</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#FFABAB" }} onClick={() => handleGridClick('/assign-routes')}>
                            <h3>Assign Routes</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#FFC3A0" }} onClick={() => handleGridClick('/modify-employee')}>
                            <h3>Modify Employee Details</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#FF6F61" }} onClick={() => handleGridClick('/display-employees')}>
                            <h3>Display All Employees</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#D4E157" }} onClick={() => handleGridClick('/check-route')}>
                            <h3>Check Route for an Employee</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#FFD54F" }} onClick={() => handleGridClick('/an-employee-history')}>
                            <h3>An Employee History</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#acacf4" }} onClick={() => handleGridClick('/history')}>
                            <h3>History</h3>
                        </div>
                        <div className="grid-item" style={{ backgroundColor: "#A5D6A7" }} onClick={handleLogout}>
                            <h3>Logout</h3>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Dashboard;
