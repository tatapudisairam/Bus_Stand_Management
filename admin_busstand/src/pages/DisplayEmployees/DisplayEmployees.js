import React, { useEffect, useState } from 'react';
import './DisplayEmployees.css';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Pagination from '@mui/material/Pagination';

const DisplayEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busStandName, setBusStandName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage] = useState(8);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();
    const adminUsername = localStorage.getItem('username');

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
    }, [searchTerm, jobTypeFilter, sortConfig, employees]);

    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
            if (prevConfig.key === key) {
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    return (
        <div className="de-main-container">
            <div className="de-home-icon" onClick={() => navigate('/dashboard')}>
                <FaHome size={30} />
            </div>
            <h1>Employees at {busStandName || 'Loading...'}</h1>

            <div className="de-search-filter-sort-container">
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="de-search-input"
                />
                <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="de-job-filter"
                >
                    <option value="All">All Job Types</option>
                    <option value="Driver">Driver</option>
                    <option value="Conductor">Conductor</option>
                    <option value="Door_Attendant">Door Attendant</option>
                </select>

                <div className="de-sort-buttons">
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
                    <table className="de-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Contact Info</th>
                                <th>Job Type</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmployees.length > 0 ? (
                                currentEmployees.map((employee) => (
                                    <tr key={employee.id} onClick={() => setSelectedEmployee(employee)}>
                                        <td>{employee.employee_username}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.job_type}</td>
                                        <td>{new Date(employee.time_stamp).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No employees found.</td>
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
                <div className="de-modal-overlay" onClick={() => setSelectedEmployee(null)}>
                    <div className="de-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Employee Details</h2>
                        <p><strong>Username:</strong> {selectedEmployee.employee_username}</p>
                        <p><strong>Email:</strong> {selectedEmployee.email}</p>
                        <p><strong>Job Type:</strong> {selectedEmployee.job_type}</p>
                        <p><strong>Joined:</strong> {new Date(selectedEmployee.time_stamp).toLocaleString()}</p>
                        <button onClick={() => setSelectedEmployee(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisplayEmployees;
