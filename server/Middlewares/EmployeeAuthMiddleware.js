const Employee = require("../Models/EmployeeModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.employeeVerification = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ status: false });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false });
        } else {
            const employee = await Employee.findById(data.id);
            if (employee) {
                return res.json({ status: true, employee: employee.username, employeeId: employee._id });
            } else {
                return res.json({ status: false });
            }
        }
    });
};
