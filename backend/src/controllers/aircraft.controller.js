import pool from "../config/db.js";

export const getAircraft = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM aircraft LIMIT 100"
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