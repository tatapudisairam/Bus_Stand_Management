
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./Routes/AdminRoutes");
const employeeRoutes = require("./Routes/EmployeeRoutes");
const adminSqlRoutes = require("./Routes/AdminSqlRoutes.js");
const employeeSqlRoutes = require("./Routes/EmployeeSqlRoutes.js");
const mongoRoutes = require("./Routes/MongodbRoutes")
const sqlConnection = require("./Config/sql_db.js")
const empSqlConnection = require("./Config/employee_sql_db.js")


require("dotenv").config();
const { connectDB } = require("./Config/db.js");

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));


app.use(express.json()); ``
app.use(cookieParser());

connectDB();
app.use("/auth/admin", adminRoutes);
app.use("/auth/employee", employeeRoutes);
app.use("/sql", adminSqlRoutes);
app.use("/mongo", mongoRoutes);
app.use("/sql/employee", employeeSqlRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
