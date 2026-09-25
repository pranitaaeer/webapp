import pool from "../config/db.js";

// Get crew
export const getCrew = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM service_request_crew LIMIT 100"
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get passengers
export const getPassengers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM service_request_passengers LIMIT 100"
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};