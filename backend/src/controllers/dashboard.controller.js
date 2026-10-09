

// import pool from "../config/db.js";

// export const getDashboardSummary = async (req, res, next) => {
//   try {
//     const [requests] = await pool.query(
//       "SELECT COUNT(*) AS total FROM service_request"
//     );

//     const [aircraft] = await pool.query(
//       "SELECT COUNT(*) AS total FROM aircraft"
//     );

//     const [crew] = await pool.query(
//       "SELECT COUNT(*) AS total FROM service_request_crew"
//     );

//     const [passengers] = await pool.query(
//       "SELECT COUNT(*) AS total FROM service_request_passengers"
//     );

//     res.status(200).json({
//       success: true,
//       data: {
//         totalRequests: requests[0].total,
//         totalAircraft: aircraft[0].total,
//         totalCrew: crew[0].total,
//         totalPassengers: passengers[0].total,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// export const getRecentFlights = async (req, res, next) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT
//         sr.SRID                        AS SRID,
//         sr.Status                      AS Status,
//         sr.DateCreated                 AS DateCreated,
//         c.ClientName                   AS ClientName,
//         a.Registration                 AS AircraftName,
//         a.AircraftType                 AS AircraftType,
//         leg.SectorFrom                 AS FromAirport,
//         leg.SectorTo                   AS ToAirport,
//         leg.DateCreated                AS FlightDate,
//         (
//           SELECT COUNT(*)
//           FROM service_request_passengers p
//           WHERE p.SRID = sr.SRID
//         )                              AS PassengerCount
//       FROM service_request sr
//       LEFT JOIN client c
//         ON c.ClientID = sr.ClientID
//       LEFT JOIN aircraft a
//         ON a.AircraftID = sr.AircraftID
//       LEFT JOIN service_request_legs leg
//         ON leg.SRID = sr.SRID
//        AND leg.LegOrderTripwise = 1
//       ORDER BY sr.SRID DESC
//       LIMIT 10
//     `);

//     res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import pool from "../config/db.js";

/* ---------------------------------------------------------
   GET /dashboard/summary   →  Counts (sirf 2026)
--------------------------------------------------------- */
export const getDashboardSummary = async (req, res, next) => {
  try {
    // Flights — 2026
    const [requests] = await pool.query(
      "SELECT COUNT(*) AS total FROM service_request WHERE YEAR(DateCreated) = 2026"
    );

    // Aircraft — jo 2026 me use hue wahi count karo
    // (aircraft table me date column nahi hai, isliye service_request se count karenge)
    const [aircraft] = await pool.query(`
      SELECT COUNT(DISTINCT sr.AircraftID) AS total
      FROM service_request sr
      WHERE YEAR(sr.DateCreated) = 2026
    `);

    // Crew — 2026
    const [crew] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM service_request_crew src
      INNER JOIN service_request sr ON sr.SRID = src.SRID
      WHERE YEAR(sr.DateCreated) = 2026
    `);

    // Passengers — 2026
    const [passengers] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM service_request_passengers p
      INNER JOIN service_request sr ON sr.SRID = p.SRID
      WHERE YEAR(sr.DateCreated) = 2026
    `);

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

/* ---------------------------------------------------------
   GET /dashboard/recent-flights   →  Top 10 (sirf 2026)
--------------------------------------------------------- */
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
      WHERE YEAR(sr.DateCreated) = 2026
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