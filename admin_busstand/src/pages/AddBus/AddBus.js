import React, { useState, useEffect } from 'react';
import "./AddBus.css";
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddBus = () => {
    const [busName, setBusName] = useState('');
    const [busNumber, setBusNumber] = useState('');
    const [sourceAddress, setSourceAddress] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [startingTime, setStartingTime] = useState('');
    const [endingTime, setEndingTime] = useState('');
    const [busStandName, setBusStandName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const adminId = localStorage.getItem('adminId');
        const adminUsername = localStorage.getItem('username');

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!busName || !busNumber || !sourceAddress || !destinationAddress || !startingTime || !endingTime || !busStandName) {
            alert('Please fill in all the fields!');
            return;
        }

        const busData = {
            bus_name: busName,
            bus_number: busNumber,
            bus_stand_name: busStandName,
            source_address: sourceAddress,
            destination_address: destinationAddress,
            starting_time: startingTime,
            ending_time: endingTime,
        };

        try {
            const response = await fetch('http://localhost:5000/sql/add-bus-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(busData),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Bus added successfully:', result);
                alert('Bus added successfully!');
                setBusName('');
                setBusNumber('');
                setSourceAddress('');
                setDestinationAddress('');
                setStartingTime('');
                setEndingTime('');
            } else {
                console.error('Failed to add bus:', result.message);
                alert('Failed to add bus!');
            }
        } catch (error) {
            console.error('Error occurred:', error);
            alert('An error occurred while adding the bus!');
        }
    };

    const navigateDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className='ab-main-container'>
            <div className="ab-home-icon" onClick={navigateDashboard}>
                <FaHome size={30} />
            </div>
            <h1>Add a Bus</h1>
            <div className="ab-container">
                <div className="ab-inner-container">
                    <div className="ab-inner-left-container">
                        <div className="ab-input-div">
                            <label htmlFor="busname">Bus Name</label>
                            <input
                                type="text"
                                id="busname"
                                placeholder="Enter bus name"
                                value={busName}
                                onChange={(e) => setBusName(e.target.value)}
                            />
                        </div>
                        <div className="ab-input-div">
                            <label htmlFor="bus-number">Bus Number</label>
                            <input
                                type="text"
                                id="bus-number"
                                placeholder="Enter bus number"
                                value={busNumber}
                                onChange={(e) => setBusNumber(e.target.value)}
                            />
                        </div>
                        <div className="ab-input-div">
                            <label htmlFor="source-address">Source address</label>
                            <input
                                type="text"
                                id="source-address"
                                placeholder="Enter the source address"
                                value={sourceAddress}
                                onChange={(e) => setSourceAddress(e.target.value)}
                            />
                        </div>
                        <div className="ab-input-div">
                            <label htmlFor="destination-address">Destination address</label>
                            <input
                                type="text"
                                id="destination-address"
                                placeholder="Enter the destination address"
                                value={destinationAddress}
                                onChange={(e) => setDestinationAddress(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="ab-mid-line"></div>
                    <div className="ab-inner-left-container">
                        <div className="ab-input-div">
                            <label htmlFor="starting-time">Starting time</label>
                            <input
                                type="time"
                                id="starting-time"
                                value={startingTime}
                                onChange={(e) => setStartingTime(e.target.value)}
                            />
                        </div>
                        <div className="ab-input-div">
                            <label htmlFor="ending-time">Ending time</label>
                            <input
                                type="time"
                                id="ending-time"
                                value={endingTime}
                                onChange={(e) => setEndingTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="ab-btn-create">
                    <button className="ab-btn" onClick={handleSubmit}>
                        Add Bus
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBus;
