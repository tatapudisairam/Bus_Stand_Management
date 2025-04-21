import React, { useState, useEffect } from "react";
import "./EmployeeLogin.css";
import BusImage from './bus_authentication_img_3.png';
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EmployeeLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const employeeId = localStorage.getItem('employeeId');
        const employeeUsername = localStorage.getItem('employeeUsername');

        if (employeeId && employeeUsername) {
            navigate('/dashboard');
            return;
        }
    }, [navigate]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/auth/employee/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.status === 200 && data.success) {
                localStorage.setItem("employeeId", data.employeeId);
                localStorage.setItem("employeeUsername", data.employeeUsername);
                localStorage.setItem("token", data.token);
                navigate("/dashboard");
            } else {
                alert(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            alert("Something went wrong! Please try again.");
        }
    };

    const navigateDashboard = () => {
        navigate("/");
    };

    return (
        <div className="login-container-main">
            <div className="ca-home-icon" onClick={navigateDashboard}>
                <FaHome size={30} />
            </div>
            <h1 className="login-type">Employee Login</h1>
            <div className="login-container">
                <div className="login-left-container">
                    <div className="login-inner-left-container">
                        <p>Sign in</p>
                        <form onSubmit={handleSubmit}>
                            <div className="login-input-div">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="example.email@gmail.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                            </div>
                            <div className="login-input-div">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter at least 6+ characters"
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className="login-forgot-password">
                                <a href="/forgot-password">Forgot Password?</a>
                            </div>
                            <div className="login-btn-signin">
                                <button type="submit">Sign in</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="login-right-container">
                    <img
                        src={BusImage}
                        alt="Bus Authentication"
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
