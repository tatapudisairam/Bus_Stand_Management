const empSqlConnection = require("../Config/employee_sql_db")
const Employee = require("../Models/EmployeeModel");
const { startSession } = require('mongoose');
const mysql = require('mysql2/promise');

module.exports.getEmployeeDetailsByUsername = (req, res) => {
    const { username } = req.params;


    const query = 'SELECT * FROM employees_profiles WHERE employee_username = ?';

    empSqlConnection.query(query, [username], (err, results) => {
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

module.exports.getEmployeeBusScheduleByDetails = (req, res) => {
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

    empSqlConnection.query(query, [bus_stand, username], (err, results) => {
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

module.exports.getEmployeeBusScheduleHistoryByDetails = (req, res) => {
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

    empSqlConnection.query(query, [bus_stand, username], (err, results) => {
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

// module.exports.modifyEmployeeProfile = async (req, res) => {
//     const { id } = req.params;
//     const { employee_username, old_username, job_type, email, mongoId } = req.body;

//     if (!employee_username || !job_type || !email || !mongoId || !old_username) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }

//     const connection = await mysql.createConnection({
//         host: 'localhost',
//         user: 'root',
//         password: '',
//         database: 'bus_track'
//     });
//     const session = await startSession();

//     try {
//         await connection.beginTransaction();
//         session.startTransaction();

//         const sqlDuplicateQuery = `SELECT * FROM employees_profiles WHERE employee_username = ? AND id != ?`;
//         const sqlDuplicateRows = await connection.query(sqlDuplicateQuery, [employee_username, id]);
//         if (sqlDuplicateRows[0].length > 0) {
//             throw new Error('Username already exists in SQL');
//         }

//         const mongoDuplicate = await Employee.findOne({ username: employee_username, _id: { $ne: mongoId } }).session(session);
//         if (mongoDuplicate) {
//             throw new Error('Username already exists in MongoDB');
//         }

//         const updateQuery = `UPDATE employees_profiles SET employee_username = ?, email = ? WHERE id = ?`;
//         const sqlResult = await connection.query(updateQuery, [employee_username, email, id]);
//         if (sqlResult[0].affectedRows === 0) {
//             throw new Error('Employee not found in SQL');
//         }

//         const mongoUpdate = await Employee.findByIdAndUpdate(
//             mongoId,
//             { username: employee_username, email: email },
//             { new: true, session }
//         );
//         if (!mongoUpdate) {
//             throw new Error('Employee not found in MongoDB');
//         }

//         let columnToUpdate;
//         switch (job_type.toLowerCase()) {
//             case 'driver':
//                 columnToUpdate = 'driver';
//                 break;
//             case 'conductor':
//                 columnToUpdate = 'conductor';
//                 break;
//             case 'door_attendant':
//                 columnToUpdate = 'door_attendant';
//                 break;
//             default:
//                 throw new Error('Invalid job type');
//         }

//         const updateScheduleQuery1 = `UPDATE bus_schedules SET ${columnToUpdate} = ? WHERE ${columnToUpdate} = ?`;
//         const updateScheduleQuery2 = `UPDATE bus_schedules_history SET ${columnToUpdate} = ? WHERE ${columnToUpdate} = ?`;

//         await connection.query(updateScheduleQuery1, [employee_username, old_username]);
//         await connection.query(updateScheduleQuery2, [employee_username, old_username]);

//         await connection.commit();
//         await session.commitTransaction();
//         session.endSession();

//         return res.status(200).json({
//             message: 'Employee profile updated successfully in both SQL and MongoDB, and schedules updated.',
//             success: true,
//             employee: mongoUpdate,
//         });

//     } catch (error) {
//         console.error('Error updating employee profile:', error);

//         await connection.rollback();
//         await session.abortTransaction();
//         session.endSession();

//         return res.status(500).json({ message: error.message || 'Internal Server Error' });
//     } finally {
//         connection.end();
//     }
// };

module.exports.AddBusFromEmployeeUser = (req, res) => {
    const { bus_name, bus_number, bus_stand_name, source_address, destination_address, starting_time, ending_time } = req.body;

    const query = `INSERT INTO bus_details (bus_name, bus_number, bus_stand_name, source_address, destination_address, starting_time, ending_time) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    empSqlConnection.query(query, [bus_name, bus_number, bus_stand_name, source_address, destination_address, starting_time, ending_time], (err, results) => {
        if (err) {
            console.error('Error inserting bus details:', err);

            if (err.code === 'ER_TABLEACCESS_DENIED_ERROR' || err.code === 'ER_DBACCESS_DENIED_ERROR') {
                return res.status(403).json({ message: 'Access denied. You do not have permission to add bus details.' });
            }

            return res.status(500).json({ message: 'Error adding bus', error: err.message });
        }

        res.status(200).json({ message: 'Bus added successfully', bus_id: results.insertId });
    });
};

