import React, { useState } from 'react';
import "./EmployeeForgotPassword.css";
import busImage from "./bus_authentication_img_3.png";
// import { useNavigate } from 'react-router-dom';

const EmployeeForgotPassword = () => {
    const [email, setEmail] = useState('');
    // const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleResetClick = async () => {
        if (!email) {
            alert('Please enter your email');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/employee/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.status === 200) {
                alert('Password reset link has been sent to your email!');
                // navigate('/'); 
            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className='efp-main-container'>
            <div className="efp-container">
                <div className="efp-left-container">
                    <div className="efp-inner-left-container">
                        <p>Forgot Password</p>
                        <div className="efp-input-div">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="example.email@gmail.com"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </div>
                        <div className="efp-btn-forgot">
                            <button onClick={handleResetClick}>Reset</button>
                        </div>
                        <a href='/employee-login' className='efp-login'>Login!</a>
                    </div>
                </div>
                <div className="efp-right-container">
                    <img src={busImage} alt="Bus Authentication" />
                </div>
            </div>
        </div>
    );
};

export default EmployeeForgotPassword;
