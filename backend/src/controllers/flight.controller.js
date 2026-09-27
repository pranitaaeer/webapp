// import pool from "../config/db.js";

// export const getFlightRequests = async (req, res, next) => {
//   try {
//     const [rows] = await pool.query(
//       "SELECT * FROM service_request LIMIT 100"
//     );

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
   GET /flight-requests   →  List (table ke liye)
--------------------------------------------------------- */
export const getFlightRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        sr.SRID                        AS SRID,
        sr.Status                      AS Status,
        sr.DateCreated                 AS DateCreated,
        sr.AircraftID                  AS AircraftID,
        c.ClientName                   AS ClientName,
        a.AircraftName                 AS AircraftName,
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
      LIMIT 100
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

/* ---------------------------------------------------------
   GET /flight-requests/:id   →  Single detail (modal ke liye)
--------------------------------------------------------- */
export const getFlightRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Main request
    const [reqRows] = await pool.query(
      `
      SELECT
        sr.SRID,
        sr.Status,
        sr.WayType,
        sr.FlightRule,
        sr.FlightType,
        sr.Operation,
        sr.DateCreated,
        sr.DateModifed,
        sr.ClientID,
        sr.AircraftID,
        c.ClientName              AS ClientName,
        a.AircraftName            AS AircraftName
      FROM service_request sr
      LEFT JOIN client c   ON c.ClientID   = sr.ClientID
      LEFT JOIN aircraft a ON a.AircraftID = sr.AircraftID
      WHERE sr.SRID = ?
      LIMIT 1
      `,
      [id]
    );

    if (!reqRows.length) {
      return res.status(404).json({
        success: false,
        message: "Flight request not found",
      });
    }

    // Legs (route)
    const [legs] = await pool.query(
      `
      SELECT
        SRSecID,
        SectorFrom,
        SectorTo,
        Legstage,
        LegOrderTripwise,
        Stoptype,
        DateCreated
      FROM service_request_legs
      WHERE SRID = ?
      ORDER BY LegOrderTripwise ASC
      `,
      [id]
    );

    // Passengers count
    const [paxRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM service_request_passengers
       WHERE SRID = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...reqRows[0],
        legs,
        passengerCount: paxRows[0]?.total ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
};