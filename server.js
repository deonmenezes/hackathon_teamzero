const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/usersDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    user_name: String,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

// Register API
app.post("/register", async (req, res) => {
    const { user_name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = new User({ user_name, email, password: hashedPassword });
        await newUser.save();
        res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        res.json({ success: false, message: "Error registering user." });
    }
});

// Login API
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials!" });

    res.json({ success: true, message: "Login successful!" });
});

// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));
