import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import './AssignRoutes.css';
import { FaHome } from 'react-icons/fa';

const AssignRoutes = () => {
    const [busDetails, setBusDetails] = useState([]);
    const [adminBusStand, setAdminBusStand] = useState('');
    const [selectedBus, setSelectedBus] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isViewAssignmentPopupOpen, setIsViewAssignmentPopupOpen] = useState(false);
    const [assignmentDetails, setAssignmentDetails] = useState(null);
    const [employeesByJob, setEmployeesByJob] = useState({
        Driver: [],
        Conductor: [],
        Door_Attendant: []
    });
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedConductor, setSelectedConductor] = useState('');
    const [selectedDoorAttendant, setSelectedDoorAttendant] = useState('');
    const [busAssignmentStatus, setBusAssignmentStatus] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    const formatBusDetails = useCallback((data) => {
        return data.map((bus) => {
            // Create today and tomorrow date strings
            const currentDate = moment().format('YYYY-MM-DD');
            const nextDate = moment().add(1, 'days').format('YYYY-MM-DD');

            // Create datetime objects for today's schedule
            const startingDateTimeToday = moment(`${currentDate} ${bus.starting_time}`, 'YYYY-MM-DD HH:mm:ss');

            let endingDateTimeToday = moment(`${currentDate} ${bus.ending_time}`, 'YYYY-MM-DD HH:mm:ss');
            if (endingDateTimeToday.isBefore(startingDateTimeToday)) {
                endingDateTimeToday = endingDateTimeToday.add(1, 'days');
            }

            // Check if today's start time has already passed
            const currentTime = moment();
            const useNextDay = startingDateTimeToday.isBefore(currentTime);

            // If time has passed, use tomorrow's date
            const dateToUse = useNextDay ? nextDate : currentDate;

            const startingDateTime = moment(`${dateToUse} ${bus.starting_time}`, 'YYYY-MM-DD HH:mm:ss');
            let endingDateTime = moment(`${dateToUse} ${bus.ending_time}`, 'YYYY-MM-DD HH:mm:ss');

            // If ending time is before starting time, it means it ends the next day
            if (endingDateTime.isBefore(startingDateTime)) {
                endingDateTime = endingDateTime.add(1, 'days');
            }

            return {
                ...bus,
                starting_datetime: startingDateTime.format('YYYY-MM-DD HH:mm:ss'),
                ending_datetime: endingDateTime.format('YYYY-MM-DD HH:mm:ss'),
            };
        });
    }, []);

    const checkBusAssignmentStatus = useCallback(async (busStand, busNumber) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/check-bus-schedule?bus_stand=${busStand}&bus_number=${busNumber}`);
            const data = await response.json();

            setBusAssignmentStatus(prev => ({
                ...prev,
                [busNumber]: data.status
            }));
        } catch (error) {
            console.error(`Error checking assignment status for bus ${busNumber}:`, error);
            setBusAssignmentStatus(prev => ({
                ...prev,
                [busNumber]: 'Not Assigned'
            }));
        }
    }, []);

    const fetchBusDetails = useCallback(async (busStand) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/all-bus-details?bus_stand_name=${busStand}`);
            const data = await response.json();

            const busData = Array.isArray(data) ? data : [];
            const formattedData = formatBusDetails(busData);
            setBusDetails(formattedData);

            formattedData.forEach(bus => {
                checkBusAssignmentStatus(busStand, bus.bus_number);
            });
        } catch (error) {
            console.error('Error fetching bus details:', error);
            setBusDetails([]);
        }
    }, [formatBusDetails, checkBusAssignmentStatus]);

    const fetchEmployeesByJob = useCallback(async (busStand) => {
        try {
            const jobTypes = ['Driver', 'Conductor', 'Door_Attendant'];
            const employeesData = {
                Driver: [],
                Conductor: [],
                Door_Attendant: []
            };

            for (const job of jobTypes) {
                const response = await fetch(`http://localhost:5000/sql/employees-by-job-busstand?job_type=${job}&bus_stand=${busStand}`);
                const data = await response.json();

                console.log(`Data for ${job}:`, data);

                employeesData[job] = Array.isArray(data) ? data : [];
            }

            setEmployeesByJob(employeesData);
        } catch (error) {
            console.error('Error fetching employee details:', error);
            setEmployeesByJob({
                Driver: [],
                Conductor: [],
                Door_Attendant: []
            });
        }
    }, []);

    useEffect(() => {
        const adminId = localStorage.getItem('adminId');
        const adminUsername = localStorage.getItem('username');

        if (!adminId || !adminUsername) {
            console.log('Admin is not signed in. Redirecting to login page...');
            navigate('/');
            return;
        }

        const fetchAdminDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/sql/get-admin-details/${adminUsername}`);
                const data = await response.json();

                if (response.status === 200) {
                    setAdminBusStand(data.bus_stand_name);
                    fetchBusDetails(data.bus_stand_name);
                    fetchEmployeesByJob(data.bus_stand_name);
                } else {
                    alert(data.message || 'Error fetching admin details');
                }
            } catch (error) {
                console.error('Error fetching admin details:', error);
                alert('An error occurred while fetching admin details.');
            }
        };

        fetchAdminDetails();
    }, [navigate, fetchBusDetails, fetchEmployeesByJob]);

    const fetchAssignmentDetails = useCallback(async (busStand, busNumber) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/get-bus-schedule-details?bus_stand=${busStand}&bus_number=${busNumber}`);
            const data = await response.json();
            if (response.status === 200 && data) {
                const scheduleData = data.schedule || data;
                setAssignmentDetails(scheduleData);
                setIsViewAssignmentPopupOpen(true);
            } else {
                alert('Failed to fetch assignment details');
            }
        } catch (error) {
            console.error('Error fetching assignment details:', error);
            alert('An error occurred while fetching assignment details.');
        }
    }, []);

    const handleAssignClick = (bus) => {
        setSelectedBus(bus);
        setIsPopupOpen(true);
        setSelectedDriver('');
        setSelectedConductor('');
        setSelectedDoorAttendant('');
    };

    const handleViewAssignment = (bus) => {
        setSelectedBus(bus);
        fetchAssignmentDetails(adminBusStand, bus.bus_number);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedBus(null);
        setSelectedDriver('');
        setSelectedConductor('');
        setSelectedDoorAttendant('');
        setIsEditMode(false);
    };

    const closeAssignmentPopup = () => {
        setIsViewAssignmentPopupOpen(false);
        setAssignmentDetails(null);
        setSelectedBus(null);
    };

    const navigateDashboard = () => {
        navigate('/dashboard');
    };

    const handleEditAssignment = () => {
        const busToEdit = busDetails.find(bus => bus.bus_number === assignmentDetails.bus_number);

        if (busToEdit) {
            setSelectedBus(busToEdit);

            setSelectedDriver(assignmentDetails.driver);
            setSelectedConductor(assignmentDetails.conductor);
            setSelectedDoorAttendant(assignmentDetails.door_attendant);

            setIsEditMode(true);

            setIsViewAssignmentPopupOpen(false);

            setIsPopupOpen(true);
        } else {
            alert('Bus details not found. Please refresh the page and try again.');
        }
    };

    const checkEmployeeAvailability = async (role, employeeUsername) => {
        if (!employeeUsername) return false;

        try {
            const endpointRole = role === 'doorAttendant' ? 'door-attendant' : role;

            const response = await fetch(
                `http://localhost:5000/sql/check-${endpointRole}-availability?employee_username=${employeeUsername}&bus_stand=${adminBusStand}`
            );
            const data = await response.json();

            const isAvailable = data.message === 'Driver is available' ||
                data.message === 'Conductor is available' ||
                data.message === 'Door attendant is available';

            if (!isAvailable) {
                alert(data.message);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error checking ${role} availability:`, error);
            alert(`Network error while checking ${role} availability.`);
            return false;
        }
    };

    const handleEmployeeSelection = async (role, value) => {
        if (!value) {
            switch (role) {
                case 'driver':
                    setSelectedDriver('');
                    break;
                case 'conductor':
                    setSelectedConductor('');
                    break;
                case 'doorAttendant':
                    setSelectedDoorAttendant('');
                    break;
                default:
                    break;
            }
            return;
        }

        const isAvailable = await checkEmployeeAvailability(role, value);

        if (isAvailable) {
            switch (role) {
                case 'driver':
                    setSelectedDriver(value);
                    break;
                case 'conductor':
                    setSelectedConductor(value);
                    break;
                case 'doorAttendant':
                    setSelectedDoorAttendant(value);
                    break;
                default:
                    break;
            }
        }
    };

    const handleAddSchedule = async () => {
        if (!selectedDriver || !selectedConductor || !selectedDoorAttendant) {
            alert("Please select all employees.");
            return;
        }

        let isDriverAvailable = true;
        let isConductorAvailable = true;
        let isDoorAttendantAvailable = true;

        if (isEditMode) {
            if (assignmentDetails && selectedDriver !== assignmentDetails.driver) {
                isDriverAvailable = await checkEmployeeAvailability('driver', selectedDriver);
            }
            if (assignmentDetails && selectedConductor !== assignmentDetails.conductor) {
                isConductorAvailable = await checkEmployeeAvailability('conductor', selectedConductor);
            }
            if (assignmentDetails && selectedDoorAttendant !== assignmentDetails.door_attendant) {
                isDoorAttendantAvailable = await checkEmployeeAvailability('doorAttendant', selectedDoorAttendant);
            }
        } else {
            isDriverAvailable = await checkEmployeeAvailability('driver', selectedDriver);
            isConductorAvailable = await checkEmployeeAvailability('conductor', selectedConductor);
            isDoorAttendantAvailable = await checkEmployeeAvailability('doorAttendant', selectedDoorAttendant);
        }

        if (!isDriverAvailable || !isConductorAvailable || !isDoorAttendantAvailable) {
            return;
        }

        try {
            let response;
            let data;

            if (isEditMode) {
                const updateData = {
                    bus_stand: adminBusStand,
                    bus_number: selectedBus.bus_number,
                    driver: selectedDriver,
                    conductor: selectedConductor,
                    door_attendant: selectedDoorAttendant
                };

                response = await fetch('http://localhost:5000/sql/update-bus-schedule', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                data = await response.json();

                if (response.status === 200) {
                    alert('Bus schedule updated successfully!');
                } else {
                    alert(data.message || 'Failed to update bus schedule.');
                }
            } else {
                const scheduleData = {
                    source_address: selectedBus.source_address,
                    destination_address: selectedBus.destination_address,
                    bus_stand: adminBusStand,
                    starting_time: selectedBus.starting_datetime,
                    ending_time: selectedBus.ending_datetime,
                    username: localStorage.getItem('username'),
                    bus_number: selectedBus.bus_number,
                    driver: selectedDriver,
                    conductor: selectedConductor,
                    door_attendant: selectedDoorAttendant,
                };

                response = await fetch('http://localhost:5000/sql/add-bus-schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(scheduleData),
                });

                data = await response.json();

                if (response.status === 201) {
                    alert('Bus schedule added successfully!');
                } else {
                    alert(data.message || 'Failed to add bus schedule.');
                }
            }

            if (response.status === 200 || response.status === 201) {
                setIsEditMode(false);
                closePopup();

                setBusAssignmentStatus(prev => ({
                    ...prev,
                    [selectedBus.bus_number]: 'Assigned'
                }));

                fetchBusDetails(adminBusStand);
            }
        } catch (error) {
            console.error('Error managing bus schedule:', error);
            alert('An error occurred while managing the bus schedule.');
        }
    };

    const handleRemoveAssignment = async () => {
        if (!window.confirm("Are you sure you want to remove this assignment?")) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/sql/delete-bus-schedule?bus_stand=${adminBusStand}&bus_number=${assignmentDetails.bus_number}`,
                {
                    method: 'DELETE',
                }
            );

            const data = await response.json();

            if (response.status === 200) {
                alert('Assignment removed successfully!');
                closeAssignmentPopup();

                setBusAssignmentStatus(prev => ({
                    ...prev,
                    [assignmentDetails.bus_number]: 'Not Assigned'
                }));

                fetchBusDetails(adminBusStand);
            } else {
                alert(data.message || 'Failed to remove assignment.');
            }
        } catch (error) {
            console.error('Error removing assignment:', error);
            alert('An error occurred while removing the assignment.');
        }
    };

    const isFormComplete = selectedDriver && selectedConductor && selectedDoorAttendant;

    return (
        <div className='assign-main-container'>
            <div className='assign-upsection'>
                <div className="assign-upsection-inner">
                    <p className="assign-title-main">Upcoming Bus Schedules</p>
                    <p className="assign-busstand">Bus Stand: {adminBusStand}</p>
                </div>

                <div className="assign-home-icon" onClick={navigateDashboard}>
                    <FaHome size={30} />
                </div>
            </div>

            <div className="assign-downsection">
                {busDetails.length > 0 ? (
                    busDetails.map((bus) => (
                        <div key={bus.id} className="assign-grid-item">
                            <p className="assign-title">{bus.bus_name}</p>
                            <p className="assign-description">Bus Number: {bus.bus_number}</p>
                            <p className="assign-description">Source: {bus.source_address}</p>
                            <p className="assign-description">Destination: {bus.destination_address}</p>
                            <p className="assign-description">Starting Time: {bus.starting_datetime}</p>
                            <p className="assign-description">Ending Time: {bus.ending_datetime}</p>

                            {busAssignmentStatus[bus.bus_number] === 'Assigned' ? (
                                <div
                                    onClick={() => handleViewAssignment(bus)}
                                    className="assign-assigned-text"
                                >
                                    Assigned (Click to View)
                                </div>
                            ) : (
                                <button className="assign-btn" onClick={() => handleAssignClick(bus)}>Assign</button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="assign-no-bus-details">No bus details found for {adminBusStand}.</p>
                )}
            </div>

            {isPopupOpen && selectedBus && (
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Bus Details</h2>
                        <p><strong>Bus Name:</strong> {selectedBus.bus_name}</p>
                        <p><strong>Bus Number:</strong> {selectedBus.bus_number}</p>
                        <p><strong>Source:</strong> {selectedBus.source_address}</p>
                        <p><strong>Destination:</strong> {selectedBus.destination_address}</p>
                        <p><strong>Starting Time:</strong> {selectedBus.starting_datetime}</p>
                        <p><strong>Ending Time:</strong> {selectedBus.ending_datetime}</p>

                        <div className="popup-inputs">
                            <select
                                className="popup-select"
                                value={selectedDriver}
                                onChange={(e) => handleEmployeeSelection('driver', e.target.value)}
                            >
                                <option value="">Select Driver</option>
                                {Array.isArray(employeesByJob.Driver) ? employeesByJob.Driver.map((employee) => (
                                    <option key={employee.id} value={employee.employee_username}>
                                        {employee.employee_username}
                                    </option>
                                )) : null}
                            </select>

                            <select
                                className="popup-select"
                                value={selectedConductor}
                                onChange={(e) => handleEmployeeSelection('conductor', e.target.value)}
                            >
                                <option value="">Select Conductor</option>
                                {Array.isArray(employeesByJob.Conductor) ? employeesByJob.Conductor.map((employee) => (
                                    <option key={employee.id} value={employee.employee_username}>
                                        {employee.employee_username}
                                    </option>
                                )) : null}
                            </select>

                            <select
                                className="popup-select"
                                value={selectedDoorAttendant}
                                onChange={(e) => handleEmployeeSelection('doorAttendant', e.target.value)}
                            >
                                <option value="">Select Door Attendant</option>
                                {Array.isArray(employeesByJob.Door_Attendant) ? employeesByJob.Door_Attendant.map((employee) => (
                                    <option key={employee.id} value={employee.employee_username}>
                                        {employee.employee_username}
                                    </option>
                                )) : null}
                            </select>
                        </div>

                        <div className="popup-buttons">
                            <button
                                className={`add-btn ${!isFormComplete ? 'add-btn-disabled' : ''}`}
                                onClick={handleAddSchedule}
                                disabled={!isFormComplete}
                            >
                                {isEditMode ? 'Update' : 'Add'}
                            </button>
                            <button className="close-btn" onClick={closePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {isViewAssignmentPopupOpen && assignmentDetails && (
                <div className="popup-overlay" onClick={closeAssignmentPopup}>
                    <div className="popup-content assignment-popup" onClick={(e) => e.stopPropagation()}>
                        <h2>Assignment Details</h2>
                        <div className="assignment-info">
                            <p><strong>Bus Number:</strong> {assignmentDetails.bus_number}</p>
                            <p><strong>Source:</strong> {assignmentDetails.source_address}</p>
                            <p><strong>Destination:</strong> {assignmentDetails.destination_address}</p>
                            <p><strong>Starting Time:</strong> {moment(assignmentDetails.starting_time).format('YYYY-MM-DD HH:mm:ss')}</p>
                            <p><strong>Ending Time:</strong> {moment(assignmentDetails.ending_time).format('YYYY-MM-DD HH:mm:ss')}</p>
                        </div>

                        <div className="assignment-staff">
                            <h3>Assigned Staff</h3>
                            <p><strong>Driver:</strong> {assignmentDetails.driver}</p>
                            <p><strong>Conductor:</strong> {assignmentDetails.conductor}</p>
                            <p><strong>Door Attendant:</strong> {assignmentDetails.door_attendant}</p>
                        </div>

                        <div className="popup-buttons">
                            <button className="edit-btn" onClick={handleEditAssignment}>Edit</button>
                            <button className="remove-btn" onClick={handleRemoveAssignment}>Remove</button>
                            <button className="close-btn" onClick={closeAssignmentPopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignRoutes;