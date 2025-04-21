import React, { useState, useEffect } from 'react';
import './AdminSignup.css';
import BusImage from './bus_authentication_img_3.png';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busStands, setBusStands] = useState([]);
    const [selectedBusStand, setSelectedBusStand] = useState('');
    const [isBusStandAvailable, setIsBusStandAvailable] = useState(false);
    const navigate = useNavigate();

    // Fetching bus stands when the component mounts
    useEffect(() => {
        const fetchBusStands = async () => {
            try {
                const response = await fetch('http://localhost:5000/sql/all-bus-stands');
                const data = await response.json();
                if (response.ok) {
                    setBusStands(data);
                } else {
                    alert('Failed to load bus stands');
                }
            } catch (error) {
                console.error('Error fetching bus stands:', error);
                alert('An error occurred while fetching bus stands.');
            }
        };

        fetchBusStands();
    }, []);

    const handleUsernameChange = (e) => setUsername(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleBusStandChange = (e) => {
        const busStandId = e.target.value;
        setSelectedBusStand(busStandId);

        // Get the bus stand name from the selected bus stand ID
        const selectedBusStandName = busStands.find(busStand => busStand.bus_stand_id === parseInt(busStandId))?.bus_stand_name;

        if (selectedBusStandName) {
            checkBusStandAvailability(selectedBusStandName);
        }
    };

    // Check if the selected bus stand is available for signup
    const checkBusStandAvailability = async (busStandName) => {
        try {
            const response = await fetch('http://localhost:5000/sql/check-bus-stand-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bus_stand_name: busStandName }),  // Send bus_stand_name instead of bus_stand_id
            });

            const data = await response.json();
            if (data.available) {
                setIsBusStandAvailable(true);
            } else {
                setIsBusStandAvailable(false);
                alert('Bus stand is not available for signup');
            }
        } catch (error) {
            console.error('Error checking bus stand availability:', error);
            alert('An error occurred while checking bus stand availability.');
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Input validation
        if (!username || !email || !password || !selectedBusStand) {
            alert('All fields are required');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (!isBusStandAvailable) {
            alert('Selected bus stand is not available for signup');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/admin/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username, bus_stand_id: selectedBusStand }),
            });

            const data = await response.json();

            if (response.status === 201) {
                // Successfully signed up, navigate to login page
                alert('Account created successfully!');
                navigate('/');
            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className='ca-main-container'>
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
                                />
                            </div>
                            <div className="ca-input-div">
                                <label htmlFor="busStand">Select Bus Stand</label>
                                <select
                                    id="busStand"
                                    value={selectedBusStand}
                                    onChange={handleBusStandChange}
                                >
                                    <option value="">Select a bus stand</option>
                                    {busStands.map((busStand) => (
                                        <option key={busStand.bus_stand_id} value={busStand.bus_stand_id}>
                                            {busStand.bus_stand_name}
                                        </option>
                                    ))}
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
