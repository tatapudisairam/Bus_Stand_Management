

const { GetEmployeeIdByUsername } = require("../Controllers/MongodbController");
const router = require("express").Router();

router.post("/get-employee-id", GetEmployeeIdByUsername);

module.exports = router;
