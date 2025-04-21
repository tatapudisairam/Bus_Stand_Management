import React, { useState, useEffect } from 'react';
import './EmployeeResetPassword.css';
import busImage from './bus_authentication_img_3.png';
import { useParams, useNavigate } from 'react-router-dom';

const EmployeeResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const handleResetClick = async () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/auth/employee/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.status === 200) {
                alert(data.message || 'Password reset successfully!');
                //navigate('/login'); 
            } else {
                alert(data.message || 'Something went wrong, please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='erp-main-container'>
            <div className="erp-container">
                <div className="erp-left-container">
                    <div className="erp-inner-left-container">
                        <p>Reset Password</p>
                        <div className="erp-input-div">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter at least 6+ characters"
                                value={password}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <div className="erp-input-div">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                placeholder="Enter the above password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                        </div>
                        <div className="erp-btn-reset">
                            <button onClick={handleResetClick} disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="erp-right-container">
                    <img src={busImage} alt="Bus Authentication" />
                </div>
            </div>
        </div>
    );
};

export default EmployeeResetPassword;
