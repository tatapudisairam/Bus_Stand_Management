import React, { useState } from "react";
import "./UserLogin.css";
import BusImage from './bus_authentication_img_3.png'

const UserLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Email:", email);
        console.log("Password:", password);
    };

    return (
        <div className="login-container-main">
            <h1 className="login-type">User Login</h1>
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

export default UserLogin;
