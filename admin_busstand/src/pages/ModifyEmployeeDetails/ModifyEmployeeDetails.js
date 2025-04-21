import React, { useEffect, useState } from 'react';
import './ModifyEmployeeDetails.css';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Pagination from '@mui/material/Pagination';

const ModifyEmployeeDetails = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busStandName, setBusStandName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage] = useState(8);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [editingUsername, setEditingUsername] = useState(null);
    const navigate = useNavigate();
    const adminUsername = localStorage.getItem('username');
    const [jobTypeFilter, setJobTypeFilter] = useState('All');

    useEffect(() => {
        const adminId = localStorage.getItem('adminId');
        if (!adminId || !adminUsername) {
            navigate('/');
        } else {
            fetchAdminDetails(adminUsername);
        }
    }, [navigate]);

    const fetchAdminDetails = async (username) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/get-admin-details/${username}`);
            const data = await response.json();
            if (response.ok) {
                setBusStandName(data.bus_stand_name);
                fetchEmployees(data.bus_stand_name);
            } else {
                alert('Admin details not found!');
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
            alert('An error occurred while fetching admin details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async (busStand) => {
        try {
            const response = await fetch(`http://localhost:5000/sql/all-employees-by-bus-stand/${busStand}`);
            const data = await response.json();
            if (response.ok) {
                setEmployees(data);
                setFilteredEmployees(data);
            } else {
                alert('No employees found!');
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
            alert('An error occurred while fetching employee details.');
        }
    };

    const fetchEmployeeIdByUsername = async (username) => {
        try {
            const response = await fetch('http://localhost:5000/mongo/get-employee-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const data = await response.json();
            if (response.ok) {
                setEmployeeId(data.employeeId);
            } else {
                alert('Employee ID not found!');
            }
        } catch (error) {
            console.error('Error fetching employee ID:', error);
            alert('An error occurred while fetching employee ID.');
        }
    };

    const handleEditClick = (employee) => {
        setSelectedEmployee(employee);
        setEditingUsername(employee.employee_username);
        fetchEmployeeIdByUsername(employee.employee_username);
    };

    useEffect(() => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(emp =>
                emp.employee_username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (jobTypeFilter !== 'All') {
            filtered = filtered.filter(emp => emp.job_type === jobTypeFilter);
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredEmployees(filtered);
        setCurrentPage(1);
    }, [searchTerm, sortConfig, employees, jobTypeFilter]);

    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
            if (prevConfig.key === key) {
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handleUpdateEmployee = async () => {
        try {
            const response = await fetch(`http://localhost:5000/sql/update-employee-profile/${selectedEmployee.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_username: selectedEmployee.employee_username,
                    old_username: editingUsername,
                    job_type: selectedEmployee.job_type,
                    email: selectedEmployee.email,
                    mongoId: employeeId,
                }),
            });

            if (response.status === 409) {
                const data = await response.json();
                alert(data.message);
            } else if (response.ok) {
                const data = await response.json();
                alert(data.message);
                fetchEmployees(busStandName);
                setSelectedEmployee(null);
                setEditingUsername(null);
            } else {
                alert('Failed to update employee details.');
            }

        } catch (error) {
            console.error('Error updating employee:', error);
            alert('An error occurred while updating employee details.');
        }
    };

    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    return (
        <div className="me-main-container">
            <div className="me-home-icon" onClick={() => navigate('/dashboard')}>
                <FaHome size={30} />
            </div>
            <h1>Edit Employees at {busStandName || 'Loading...'}</h1>

            <div className="me-search-filter-sort-container">
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="me-search-input"
                />

                <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="me-job-filter"
                >
                    <option value="All">All Job Types</option>
                    <option value="Driver">Driver</option>
                    <option value="Conductor">Conductor</option>
                    <option value="Door_Attendant">Door Attendant</option>
                </select>

                <div className="me-sort-buttons">
                    <button onClick={() => handleSort('employee_username')}>
                        Sort by Username {sortConfig.key === 'employee_username' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </button>
                    <button onClick={() => handleSort('time_stamp')}>
                        Sort by Time {sortConfig.key === 'time_stamp' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading employees...</p>
            ) : (
                <>
                    <table className="me-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Contact Info</th>
                                <th>Job Type</th>
                                <th>Time</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmployees.length > 0 ? (
                                currentEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>{employee.employee_username}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.job_type}</td>
                                        <td>{new Date(employee.time_stamp).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="me-edit-button"
                                                onClick={() => handleEditClick(employee)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No employees found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                backgroundColor: '#5068E2',
                                color: 'white',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                transition: 'background 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#3949ab',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: '#3949ab !important',
                                    color: 'white !important',
                                    transform: 'scale(1.1)',
                                    transition: 'transform 0.2s ease',
                                },
                            },
                        }}
                    />
                </>
            )}

            {selectedEmployee && (
                <div className="me-modal-overlay" onClick={() => { setSelectedEmployee(null); setEditingUsername(null); }}>
                    <div className="me-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Employee Details</h2>

                        <div className="me-employee-details">
                            <p><strong>SQL ID:</strong> {selectedEmployee.id}</p>
                            <p><strong>MongoDB ID:</strong> {employeeId || 'Loading...'}</p>
                            <p><strong>Joined:</strong> {new Date(selectedEmployee.time_stamp).toLocaleString()}</p>
                            <p><strong>Username:</strong> {selectedEmployee.employee_username}</p>
                            <p><strong>Job Type:</strong> {selectedEmployee.job_type}</p>
                            <p><strong>Email:</strong> {selectedEmployee.email}</p>
                        </div>

                        <div className='me-edit-form'>
                            <input
                                type="text"
                                placeholder="New Username"
                                value={selectedEmployee.employee_username}
                                onChange={(e) =>
                                    setSelectedEmployee({
                                        ...selectedEmployee,
                                        employee_username: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="email"
                                placeholder="New Email"
                                value={selectedEmployee.email}
                                onChange={(e) =>
                                    setSelectedEmployee({
                                        ...selectedEmployee,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <button onClick={handleUpdateEmployee}>Update Details</button>
                        <button className="me-close-button" onClick={() => { setSelectedEmployee(null); setEditingUsername(null); }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModifyEmployeeDetails;
