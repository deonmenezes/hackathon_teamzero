import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const app = express();
const PORT = 5000;
const SECRET_KEY = "supersecretkey"; // Change this for security

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
const MONGO_URI = "mongodb://127.0.0.1:27017/hackathon"; // Check your MongoDB URI
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" } // "admin" or "user"
});

const User = mongoose.model("User", userSchema);

// ✅ Register User
app.post("/register", async (req, res) => {
    try {
        const { user_name, email, password } = req.body;

        if (!user_name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ user_name, email, password: hashedPassword });

        const savedUser = await newUser.save();
        console.log("✅ User saved in MongoDB:", savedUser);

        res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ success: false, message: "Registration failed!" });
    }
});

// ✅ Login User
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ success: true, token, role: user.role, user_name: user.user_name });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ success: false, message: "Login failed!" });
    }
});

// ✅ Fetch All Users (For Admin)
app.get("/admin/users", async (req, res) => {
    try {
        const users = await User.find({}, "user_name email role");
        res.json({ success: true, users });
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ success: false, message: "Error fetching users!" });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
