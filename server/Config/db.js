
const mongoose = require("mongoose");

module.exports.connectDB = async () => {
    await mongoose.connect("mongodb+srv://simba_roy:Bus_Track_7205@cluster0.a8bwk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        .then(() => console.log("MongoDB connected"));
};
