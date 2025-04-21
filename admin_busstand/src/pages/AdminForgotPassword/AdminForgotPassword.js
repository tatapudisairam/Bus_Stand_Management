import React, { useState } from 'react';
import "./AdminForgotPassword.css";
import busImage from "./bus_authentication_img_3.png";

const AdminForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleResetClick = async () => {
        if (!email) {
            alert('Please enter your email');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/admin/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.status === 200) {
                alert('Password reset link has been sent to your email!');

            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className='fp-main-container'>
            <div className="fp-container">
                <div className="fp-left-container">
                    <div className="fp-inner-left-container">
                        <p>Forgot Password</p>
                        <div className="fp-input-div">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="example.email@gmail.com"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </div>
                        <div className="fp-btn-forgot">
                            <button onClick={handleResetClick}>Reset</button>
                        </div>
                        <a href='/' className='fp-login'>Login!</a>
                    </div>
                </div>
                <div className="fp-right-container">
                    <img src={busImage} alt="Bus Authentication" />
                </div>
            </div>
        </div>
    );
};

export default AdminForgotPassword;
