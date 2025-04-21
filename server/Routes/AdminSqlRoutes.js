const express = require('express');
const router = express.Router();
const { AllBusStands, CheckBusStandAvailability, getAdminDetailsByUsername, AddBus, getAllBusDetails, addBusSchedule,
    getEmployeesByJobAndBusStand, checkDriverAvailability, checkConductorAvailability, checkDoorAttendantAvailability,
    checkBusScheduleStatus, deleteBusSchedule, getBusScheduleDetails, updateBusSchedule, AllEmployeesByBusStand,
    updateEmployeeProfile, getEmployeeDetailsByUsername, getBusScheduleByDetails, getBusScheduleHistoryByDetails,
    getAllBusSchedulesByBusStand } = require("../Controllers/AdminSqlController");

router.get("/all-bus-stands", AllBusStands);
router.post("/check-bus-stand-availability", CheckBusStandAvailability);
router.get("/get-admin-details/:username", getAdminDetailsByUsername);
router.post("/add-bus-details", AddBus);
router.get("/all-bus-details", getAllBusDetails);
router.post("/add-bus-schedule", addBusSchedule);
router.get("/employees-by-job-busstand", getEmployeesByJobAndBusStand);
router.get("/check-driver-availability", checkDriverAvailability);
router.get("/check-conductor-availability", checkConductorAvailability);
router.get("/check-door-attendant-availability", checkDoorAttendantAvailability);
router.get('/check-bus-schedule', checkBusScheduleStatus);
router.delete('/delete-bus-schedule', deleteBusSchedule);
router.get('/get-bus-schedule-details', getBusScheduleDetails);
router.put('/update-bus-schedule', updateBusSchedule);
router.get("/all-employees-by-bus-stand/:bus_stand_name", AllEmployeesByBusStand);
router.put('/update-employee-profile/:id', updateEmployeeProfile);
router.get('/employee/:username', getEmployeeDetailsByUsername);
router.post('/bus-schedule', getBusScheduleByDetails);
router.post('/bus-schedule-history', getBusScheduleHistoryByDetails);
router.get("/bus-schedules-by-bus-stand/:bus_stand_name", getAllBusSchedulesByBusStand);


module.exports = router;



