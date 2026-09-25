import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Airline Crew API is running",
  });
});

// Database connection test
app.get("/api/db-status", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");

    res.status(200).json({
      success: true,
      message: "Database connected successfully",
      connected: rows[0].connected === 1,
    });
  }catch (error) {
  console.log("FULL ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

  res.status(500).json({
    success: false,
    message: "Database connection failed",
  });
}
});

import apiRoutes from "./routes/apiRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

app.use(errorHandler);
app.use("/api", apiRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});