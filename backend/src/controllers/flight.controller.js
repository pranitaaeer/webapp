import pool from "../config/db.js";

export const getFlightRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM service_request LIMIT 100"
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