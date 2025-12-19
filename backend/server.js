const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const doctorRoutes = require("./routes/doctors");
const staffRoutes = require("./routes/staff");
const appointmentRoutes = require("./routes/appointments");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/login", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/appointments", appointmentRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
