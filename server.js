require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const testRoutes = require("./routes/testRoutes");

const uploadRoutes = require("./routes/uploadRoutes");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/common/upload", uploadRoutes);

// Auth APIs
app.use("/api/auth", authRoutes);
app.use("/api/admin/tests", testRoutes);
// Swagger
app.use(
  "/BookingManagementServices",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Customer Booking APIs
app.use("/api/customer/bookings", bookingRoutes);

// Admin APIs
app.use("/api/admin", adminRoutes);

// Default Route
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Booking API is running"
//   });
// });

app.get("/", (req, res) => {
  res.redirect("/BookingManagementServices");
});

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Swagger: http://localhost:${PORT}/BookingManagementServices`
      );
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

console.log("Booking API CI/CD Test");
startServer();