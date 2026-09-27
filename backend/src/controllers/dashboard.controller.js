

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


export const getRecentFlights = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        sr.SRID                        AS SRID,
        sr.Status                      AS Status,
        sr.DateCreated                 AS DateCreated,
        c.ClientName                   AS ClientName,
        a.Registration                 AS AircraftName,
        a.AircraftType                 AS AircraftType,
        leg.SectorFrom                 AS FromAirport,
        leg.SectorTo                   AS ToAirport,
        leg.DateCreated                AS FlightDate,
        (
          SELECT COUNT(*)
          FROM service_request_passengers p
          WHERE p.SRID = sr.SRID
        )                              AS PassengerCount
      FROM service_request sr
      LEFT JOIN client c
        ON c.ClientID = sr.ClientID
      LEFT JOIN aircraft a
        ON a.AircraftID = sr.AircraftID
      LEFT JOIN service_request_legs leg
        ON leg.SRID = sr.SRID
       AND leg.LegOrderTripwise = 1
      ORDER BY sr.SRID DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};