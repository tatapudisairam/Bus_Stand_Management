import React, { useState, useEffect } from 'react';
import './CreateAccount.css';
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BusImage from './bus_authentication_img_3.png';

const CreateAccount = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [jobType, setJobType] = useState(''); // For the selected job type
    const [busStandName, setBusStandName] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const adminId = localStorage.getItem("adminId");
        const adminUsername = localStorage.getItem("username");

        if (!adminId || !adminUsername) {
            console.log('Admin is not signed in. Redirecting to login page...');
            navigate('/');
        } else {
            console.log('Fetching admin details for:', adminUsername);

            const fetchAdminDetails = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/sql/get-admin-details/${adminUsername}`);
                    const data = await response.json();

                    if (response.status === 200) {
                        setBusStandName(data.bus_stand_name);
                    } else {
                        alert(data.message || 'Error fetching admin details');
                    }
                } catch (error) {
                    console.error('Error fetching admin details:', error);
                    alert('An error occurred while fetching admin details.');
                }
            };

            fetchAdminDetails();
        }
    }, [navigate]);

    const handleUsernameChange = (e) => setUsername(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleJobTypeChange = (e) => setJobType(e.target.value); // Update jobType on change

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !jobType || !busStandName) {
            alert('All fields are required');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/employee/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    job_type: jobType,
                    bus_stand: busStandName
                }),
            });

            const data = await response.json();

            if (response.status === 201) {
                alert('Account created successfully!');
            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

    const navigateDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className='ca-main-container'>
            <div className="ca-home-icon" onClick={navigateDashboard}>
                <FaHome size={30} />
            </div>
            <h1>Create Account for an Employee</h1>
            <div className="ca-container">
                <div className="ca-left-container">
                    <div className="ca-inner-left-container">
                        <p>Create an account</p>
                        <form onSubmit={handleSubmit}>
                            <div className="ca-input-div">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    autoComplete="username"
                                />
                            </div>
                            <div className="ca-input-div">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="example.email@gmail.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                            </div>
                            <div className="ca-input-div">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter at least 6+ characters"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    autoComplete="current-password"
                                />
                            </div>

                            {/* Updated Job Type Field */}
                            <div className="ca-input-div">
                                <label htmlFor="jobType">Job Type</label>
                                <select
                                    id="jobType"
                                    value={jobType}
                                    onChange={handleJobTypeChange}
                                    required
                                >
                                    <option value="">Select Job Type</option>
                                    <option value="Driver">Driver</option>
                                    <option value="Conductor">Conductor</option>
                                    <option value="Door_Attendant">Door Attendant</option>
                                </select>
                            </div>

                            <div className="ca-btn-create">
                                <button type="submit" className="ca-btn">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="ca-right-container">
                    <img src={BusImage} alt="Bus Authentication" />
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;
