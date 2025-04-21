const express = require('express');
const router = express.Router();
const { getEmployeeDetailsByUsername, getEmployeeBusScheduleByDetails, getEmployeeBusScheduleHistoryByDetails, AddBusFromEmployeeUser } = require('../Controllers/EmployeeSqlController');

router.get("/get-employee-details/:username", getEmployeeDetailsByUsername);
router.post('/employee-bus-schedule', getEmployeeBusScheduleByDetails);
router.post('/employee-bus-schedule-history', getEmployeeBusScheduleHistoryByDetails);
router.post("/add-bus-schedule-from-employeeuser", AddBusFromEmployeeUser)

module.exports = router;
