const mysql = require('mysql');

const sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'BusStandInchargeUser',
    password: 'BusStandIncharge7205',
    database: 'bus_stand_management'
});

sqlConnection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database. (Admin role)');
});

module.exports = sqlConnection;
