const express = require('express');
const router = express.Router();
const sqlConnection = require("../Config/sql_db")
const Employee = require("../Models/EmployeeModel");
const { startSession } = require('mongoose');
const mysql = require('mysql2/promise');


module.exports.AllBusStands = (req, res) => {
    const query = 'SELECT bus_stand_id, bus_stand_name FROM bus_stand';

    sqlConnection.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving bus stands:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No bus stands found' });
        }

        return res.status(200).json(results);
    });
};

module.exports.CheckBusStandAvailability = (req, res) => {
    const { bus_stand_name } = req.body;

    const checkBusStandQuery = 'SELECT bus_stand_id FROM bus_stand WHERE bus_stand_name = ?';

    sqlConnection.query(checkBusStandQuery, [bus_stand_name], (err, results) => {
        if (err) {
            console.error('Error checking bus stand:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ available: false });
        }

        const checkAdminQuery = 'SELECT id FROM admin_profiles WHERE bus_stand_name = ?';

        sqlConnection.query(checkAdminQuery, [bus_stand_name], (err, results) => {
            if (err) {
                console.error('Error checking admin:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length > 0) {
                return res.status(400).json({ available: false });
            }

            return res.status(200).json({ available: true });
        });
    });
};

module.exports.getAdminDetailsByUsername = (req, res) => {
    const { username } = req.params;

    const query = 'SELECT * FROM admin_profiles WHERE admin_username = ?';

    sqlConnection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error retrieving admin details:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        return res.status(200).json(results[0]);
    });
};

module.exports.insertAdminProfile = (adminData, callback) => {
    const { username, bus_stand_name, email } = adminData;

    const insertAdminQuery = `
        INSERT INTO admin_profiles (admin_username, bus_stand_name, email)
        VALUES (?, ?, ?)
    `;

    sqlConnection.query(insertAdminQuery, [username, bus_stand_name, email], (err, results) => {
        if (err) {
            console.error('Error inserting into admin_profiles:', err);
            return callback(err, null);
        }
        return callback(null, results);
    });
};

module.exports.insertEmployeeProfile = (employeeData, callback) => {
    const { username, job_type, email, bus_stand } = employeeData;

    const insertEmployeeQuery = `
        INSERT INTO employees_profiles (employee_username, job_type, email, bus_stand)
        VALUES (?, ?, ?, ?)
    `;

    sqlConnection.query(insertEmployeeQuery, [username, job_type, email, bus_stand], (err, results) => {
        if (err) {
            console.error('Error inserting into employees_profiles:', err);
            return callback(err, null);
        }

        const employeeId = results.insertId;
        return callback(null, employeeId);
    });
};

module.exports.AddBus = (req, res) => {
    const { bus_name, bus_number, bus_stand_name, source_address, destination_address, starting_time, ending_time } = req.body;

    const query = `INSERT INTO bus_details (bus_name, bus_number, bus_stand_name, source_address, destination_address, starting_time, ending_time) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    sqlConnection.query(query, [bus_name, bus_number, bus_stand_name, source_address, destination_address, starting_time, ending_time], (err, results) => {
        if (err) {
            console.error('Error inserting bus details:', err);
            return res.status(500).json({ message: 'Error adding bus' });
        }
        res.status(200).json({ message: 'Bus added successfully', bus_id: results.insertId });
    });
};

module.exports.getAllBusDetails = (req, res) => {
    const { bus_stand_name } = req.query;

    if (!bus_stand_name) {
        return res.status(400).json({ message: 'Bus stand name is required' });
    }

    const query = 'SELECT * FROM bus_details WHERE bus_stand_name = ?';

    sqlConnection.query(query, [bus_stand_name], (err, results) => {
        if (err) {
            console.error('Error retrieving bus details:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No bus details found for the given bus stand' });
        }

        return res.status(200).json(results);
    });
};

module.exports.addBusSchedule = (req, res) => {
    const { source_address, destination_address, bus_stand, starting_time, ending_time, username, bus_number, driver, conductor, door_attendant } = req.body;

    if (!source_address || !destination_address || !bus_stand || !starting_time || !ending_time || !username || !bus_number || !driver || !conductor || !door_attendant) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const insertScheduleQuery = `
        INSERT INTO bus_schedules 
        (source_address, destination_address, bus_stand, starting_time, ending_time, username, bus_number, driver, conductor, door_attendant)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [source_address, destination_address, bus_stand, starting_time, ending_time, username, bus_number, driver, conductor, door_attendant];

    sqlConnection.query(insertScheduleQuery, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Duplicate entry detected. The driver, conductor, or door attendant is already assigned to another schedule.' });
            }
            console.error('Error inserting bus schedule:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        const insertHistoryQuery = `
            INSERT INTO bus_schedules_history 
            (source_address, destination_address, bus_stand, starting_time, ending_time, username, bus_number, driver, conductor, door_attendant)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const historyValues = [source_address, destination_address, bus_stand, starting_time, ending_time, username, bus_number, driver, conductor, door_attendant];

        sqlConnection.query(insertHistoryQuery, historyValues, (historyErr, historyResult) => {
            if (historyErr) {
                console.error('Error inserting into bus_schedules_history:', historyErr);
                return res.status(500).json({ message: 'Error saving history' });
            }

            return res.status(201).json({
                message: 'Bus schedule added successfully',
                scheduleId: result.insertId,
                historyId: historyResult.insertId
            });
        });
    });
};

module.exports.getEmployeesByJobAndBusStand = (req, res) => {
    const { job_type, bus_stand } = req.query;

    if (!job_type || !bus_stand) {
        return res.status(400).json({ message: 'Job type and bus stand are required' });
    }

    const query = `
        SELECT * 
        FROM employees_profiles
        WHERE job_type = ? AND bus_stand = ?
    `;

    sqlConnection.query(query, [job_type, bus_stand], (err, results) => {
        if (err) {
            console.error('Error retrieving employee data:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No employees found for the given job type and bus stand' });
        }

        return res.status(200).json(results);
    });
};

module.exports.checkDriverAvailability = (req, res) => {
    const { employee_username, bus_stand } = req.query;

    if (!employee_username || !bus_stand) {
        return res.status(400).json({ message: 'Employee username and bus stand are required' });
    }

    const query = `
        SELECT * 
        FROM bus_schedules
        WHERE driver = ? AND bus_stand = ?
    `;

    sqlConnection.query(query, [employee_username, bus_stand], (err, results) => {
        if (err) {
            console.error('Error checking driver availability:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(200).json({
                message: `Driver is not available, assigned to bus ${results[0].bus_number} from ${results[0].source_address} to ${results[0].destination_address} (${results[0].starting_time} - ${results[0].ending_time})`
            });
        } else {
            return res.status(200).json({ message: 'Driver is available' });
        }
    });
};

module.exports.checkConductorAvailability = (req, res) => {
    const { employee_username, bus_stand } = req.query;

    if (!employee_username || !bus_stand) {
        return res.status(400).json({ message: 'Employee username and bus stand are required' });
    }

    const query = `
        SELECT * 
        FROM bus_schedules
        WHERE conductor = ? AND bus_stand = ?
    `;

    sqlConnection.query(query, [employee_username, bus_stand], (err, results) => {
        if (err) {
            console.error('Error checking conductor availability:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(200).json({
                message: `Conductor is not available, assigned to bus ${results[0].bus_number} from ${results[0].source_address} to ${results[0].destination_address} (${results[0].starting_time} - ${results[0].ending_time})`
            });
        } else {
            return res.status(200).json({ message: 'Conductor is available' });
        }
    });
};

module.exports.checkDoorAttendantAvailability = (req, res) => {
    const { employee_username, bus_stand } = req.query;

    if (!employee_username || !bus_stand) {
        return res.status(400).json({ message: 'Employee username and bus stand are required' });
    }

    const query = `
        SELECT * 
        FROM bus_schedules
        WHERE door_attendant = ? AND bus_stand = ?
    `;

    sqlConnection.query(query, [employee_username, bus_stand], (err, results) => {
        if (err) {
            console.error('Error checking door attendant availability:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(200).json({
                message: `Door attendant is not available, assigned to bus ${results[0].bus_number} from ${results[0].source_address} to ${results[0].destination_address} (${results[0].starting_time} - ${results[0].ending_time})`
            });
        } else {
            return res.status(200).json({ message: 'Door attendant is available' });
        }
    });
};

module.exports.checkBusScheduleStatus = (req, res) => {
    const { bus_stand, bus_number } = req.query;

    if (!bus_stand || !bus_number) {
        return res.status(400).json({ message: 'Bus stand and bus number are required' });
    }

    const query = `
        SELECT * 
        FROM bus_schedules
        WHERE bus_stand = ? AND bus_number = ?
    `;

    sqlConnection.query(query, [bus_stand, bus_number], (err, results) => {
        if (err) {
            console.error('Error checking bus schedule:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(200).json({ status: 'Not Assigned' });
        }

        return res.status(200).json({ status: 'Assigned', schedule: results[0] });
    });
};

module.exports.getBusScheduleDetails = (req, res) => {
    const { bus_stand, bus_number } = req.query;

    if (!bus_stand || !bus_number) {
        return res.status(400).json({ message: 'Bus stand and bus number are required' });
    }

    const query = `
        SELECT * 
        FROM bus_schedules
        WHERE bus_stand = ? AND bus_number = ?
    `;

    sqlConnection.query(query, [bus_stand, bus_number], (err, results) => {
        if (err) {
            console.error('Error fetching bus schedule details:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No schedule found for this bus' });
        }

        return res.status(200).json({ schedule: results[0] });
    });
};

module.exports.deleteBusSchedule = (req, res) => {
    const { bus_stand, bus_number } = req.query;

    if (!bus_stand || !bus_number) {
        return res.status(400).json({ message: 'Bus stand and bus number are required' });
    }

    const deleteScheduleQuery = `
        DELETE FROM bus_schedules
        WHERE bus_stand = ? AND bus_number = ?
    `;

    sqlConnection.query(deleteScheduleQuery, [bus_stand, bus_number], (err, result) => {
        if (err) {
            console.error('Error deleting bus schedule:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No matching bus schedule found to delete' });
        }

        const deleteHistoryQuery = `
            DELETE FROM bus_schedules_history
            WHERE bus_stand = ? AND bus_number = ?
        `;

        sqlConnection.query(deleteHistoryQuery, [bus_stand, bus_number], (historyErr) => {
            if (historyErr) {
                console.error('Error deleting from bus_schedules_history:', historyErr);
                return res.status(500).json({ message: 'Error deleting history' });
            }

            return res.status(200).json({ message: 'Bus schedule deleted successfully' });
        });
    });
};

module.exports.updateBusSchedule = (req, res) => {
    const { bus_stand, bus_number, driver, conductor, door_attendant } = req.body;

    if (!bus_stand || !bus_number || !driver || !conductor || !door_attendant) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const updateQuery = `
        UPDATE bus_schedules
        SET driver = ?, conductor = ?, door_attendant = ?
        WHERE bus_stand = ? AND bus_number = ?
    `;

    sqlConnection.query(
        updateQuery,
        [driver, conductor, door_attendant, bus_stand, bus_number],
        (err, result) => {
            if (err) {
                console.error('Error updating bus schedule:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'No matching bus schedule found to update' });
            }

            const updateHistoryQuery = `
                UPDATE bus_schedules_history
                SET driver = ?, conductor = ?, door_attendant = ?
                WHERE bus_stand = ? AND bus_number = ?
            `;

            sqlConnection.query(updateHistoryQuery, [driver, conductor, door_attendant, bus_stand, bus_number], (historyErr) => {
                if (historyErr) {
                    console.error('Error updating bus_schedules_history:', historyErr);
                    return res.status(500).json({ message: 'Error updating history' });
                }

                return res.status(200).json({ message: 'Bus schedule updated successfully' });
            });
        }
    );
};

module.exports.AllEmployeesByBusStand = (req, res) => {
    const busStandName = req.params.bus_stand_name;

    const query = `
        SELECT id, employee_username, job_type, email, bus_stand, time_stamp
        FROM employees_profiles
        WHERE bus_stand = ?
    `;

    sqlConnection.query(query, [busStandName], (err, results) => {
        if (err) {
            console.error('Error retrieving employees:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No employees found for this bus stand' });
        }

        return res.status(200).json(results);
    });
};

module.exports.updateEmployeeProfile = async (req, res) => {
    const { id } = req.params;
    const { employee_username, old_username, job_type, email, mongoId } = req.body;

    if (!employee_username || !job_type || !email || !mongoId || !old_username) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bus_track'
    });
    const session = await startSession();

    try {
        await connection.beginTransaction();
        session.startTransaction();

        const sqlDuplicateQuery = `SELECT * FROM employees_profiles WHERE employee_username = ? AND id != ?`;
        const sqlDuplicateRows = await connection.query(sqlDuplicateQuery, [employee_username, id]);
        if (sqlDuplicateRows[0].length > 0) {
            throw new Error('Username already exists in SQL');
        }

        const mongoDuplicate = await Employee.findOne({ username: employee_username, _id: { $ne: mongoId } }).session(session);
        if (mongoDuplicate) {
            throw new Error('Username already exists in MongoDB');
        }

        const updateQuery = `UPDATE employees_profiles SET employee_username = ?, email = ? WHERE id = ?`;
        const sqlResult = await connection.query(updateQuery, [employee_username, email, id]);
        if (sqlResult[0].affectedRows === 0) {
            throw new Error('Employee not found in SQL');
        }

        const mongoUpdate = await Employee.findByIdAndUpdate(
            mongoId,
            { username: employee_username, email: email },
            { new: true, session }
        );
        if (!mongoUpdate) {
            throw new Error('Employee not found in MongoDB');
        }

        let columnToUpdate;
        switch (job_type.toLowerCase()) {
            case 'driver':
                columnToUpdate = 'driver';
                break;
            case 'conductor':
                columnToUpdate = 'conductor';
                break;
            case 'door_attendant':
                columnToUpdate = 'door_attendant';
                break;
            default:
                throw new Error('Invalid job type');
        }

        const updateScheduleQuery1 = `UPDATE bus_schedules SET ${columnToUpdate} = ? WHERE ${columnToUpdate} = ?`;
        const updateScheduleQuery2 = `UPDATE bus_schedules_history SET ${columnToUpdate} = ? WHERE ${columnToUpdate} = ?`;

        await connection.query(updateScheduleQuery1, [employee_username, old_username]);
        await connection.query(updateScheduleQuery2, [employee_username, old_username]);

        await connection.commit();
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: 'Employee profile updated successfully in both SQL and MongoDB, and schedules updated.',
            success: true,
            employee: mongoUpdate,
        });

    } catch (error) {
        console.error('Error updating employee profile:', error);

        await connection.rollback();
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    } finally {
        connection.end();
    }
};

module.exports.getEmployeeDetailsByUsername = (req, res) => {
    const { username } = req.params;

    const query = 'SELECT * FROM employees_profiles WHERE employee_username = ?';

    sqlConnection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error retrieving employee details:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        return res.status(200).json(results[0]);
    });
};

module.exports.getBusScheduleByDetails = (req, res) => {
    const { username, job_type, bus_stand } = req.body;

    if (!username || !job_type || !bus_stand) {
        return res.status(400).json({ message: 'Missing required fields: username, job_type, or bus_stand.' });
    }

    const validJobTypes = ['Driver', 'Conductor', 'Door_Attendant'];
    if (!validJobTypes.includes(job_type)) {
        return res.status(400).json({ message: 'Invalid job type. Must be Driver, Conductor, or Door_Attendant.' });
    }

    let jobColumn;
    switch (job_type) {
        case 'Driver':
            jobColumn = 'driver';
            break;
        case 'Conductor':
            jobColumn = 'conductor';
            break;
        case 'Door_Attendant':
            jobColumn = 'door_attendant';
            break;
        default:
            return res.status(400).json({ message: 'Invalid job type.' });
    }

    const query = `
        SELECT * FROM bus_schedules 
        WHERE bus_stand = ? AND ${jobColumn} = ?
    `;

    sqlConnection.query(query, [bus_stand, username], (err, results) => {
        if (err) {
            console.error('Error retrieving bus schedule:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Bus schedule not found for the given details.' });
        }

        return res.status(200).json(results[0]);
    });
};

module.exports.getBusScheduleHistoryByDetails = (req, res) => {
    const { username, job_type, bus_stand } = req.body;

    if (!username || !job_type || !bus_stand) {
        return res.status(400).json({ message: 'Missing required fields: username, job_type, or bus_stand.' });
    }

    const validJobTypes = ['Driver', 'Conductor', 'Door_Attendant'];
    if (!validJobTypes.includes(job_type)) {
        return res.status(400).json({ message: 'Invalid job type. Must be Driver, Conductor, or Door_Attendant.' });
    }

    let jobColumn;
    switch (job_type) {
        case 'Driver':
            jobColumn = 'driver';
            break;
        case 'Conductor':
            jobColumn = 'conductor';
            break;
        case 'Door_Attendant':
            jobColumn = 'door_attendant';
            break;
        default:
            return res.status(400).json({ message: 'Invalid job type.' });
    }

    const query = `
        SELECT * FROM bus_schedules_history 
        WHERE bus_stand = ? AND ${jobColumn} = ?
    `;

    sqlConnection.query(query, [bus_stand, username], (err, results) => {
        if (err) {
            console.error('Error retrieving bus schedule:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Bus schedule not found for the given details.' });
        }

        return res.status(200).json(results);
    });
};

module.exports.getAllBusSchedulesByBusStand = (req, res) => {
    const busStandName = req.params.bus_stand_name;

    const query = `
        SELECT * 
        FROM bus_schedules_history 
        WHERE bus_stand = ?
    `;

    sqlConnection.query(query, [busStandName], (err, results) => {
        if (err) {
            console.error('Error retrieving bus schedules:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No schedules found for this bus stand' });
        }

        return res.status(200).json(results);
    });
};
