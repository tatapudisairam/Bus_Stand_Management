const Employee = require("../Models/EmployeeModel");


module.exports.GetEmployeeIdByUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        const employee = await Employee.findOne({ username });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee found successfully",
            success: true,
            employeeId: employee._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};
