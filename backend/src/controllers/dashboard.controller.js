import pool from "../config/db.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [requests] = await pool.query(
      "SELECT COUNT(*) AS total FROM service_request"
    );

    const [aircraft] = await pool.query(
      "SELECT COUNT(*) AS total FROM aircraft"
    );

    const [crew] = await pool.query(
      "SELECT COUNT(*) AS total FROM service_request_crew"
    );

    const [passengers] = await pool.query(
      "SELECT COUNT(*) AS total FROM service_request_passengers"
    );

    res.status(200).json({
      success: true,
      data: {
        totalRequests: requests[0].total,
        totalAircraft: aircraft[0].total,
        totalCrew: crew[0].total,
        totalPassengers: passengers[0].total,
      },
    });
  } catch (error) {
    next(error);
  }
};