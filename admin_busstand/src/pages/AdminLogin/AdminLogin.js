import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import BusImage from './bus_authentication_img_3.png';

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const adminId = localStorage.getItem('adminId');
        const adminUsername = localStorage.getItem('username');

        if (adminId && adminUsername) {
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
            const response = await fetch("http://localhost:5000/auth/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.status === 200) {
                localStorage.setItem("adminId", data.adminId);
                localStorage.setItem("username", data.adminUsername);
                navigate("/dashboard");
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Something went wrong! Please try again.");
        }
    };

    return (
        <div className="login-container-main">
            <h1 className="login-type">Admin Login</h1>
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

export default AdminLogin;
