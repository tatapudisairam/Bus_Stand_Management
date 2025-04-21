const mysql = require('mysql');

const empSqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'EmployeeUser',
    password: 'Employee7205',
    database: 'bus_stand_management'
});

empSqlConnection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database. (Employee Role)');
});

module.exports = empSqlConnection;
