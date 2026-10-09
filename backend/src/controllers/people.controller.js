

// import pool from "../config/db.js";


// export const getCrew = async (req, res, next) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT DISTINCT
//         cc.ClientCrewID             AS ClientCrewID,
//         src.ServiceRequestCrewID    AS ServiceRequestCrewID,
//         cc.ClientCrewName           AS ClientCrewName,
//         cc.Duties                   AS Duties,
//         cc.ClientCrewPassport       AS ClientCrewPassport,
//         cc.ClientCrewContactNo      AS ClientCrewContactNo,
//         cc.ClientCrewEmailID        AS ClientCrewEmailID,
//         cc.ClientCrewNationality    AS ClientCrewNationality,
//         cc.Gender                   AS Gender,
//         cc.status                   AS status,
//         cc.ClientID                 AS ClientID
//       FROM client_crew cc
//       LEFT JOIN service_request_crew src
//         ON src.ClientCrewID = cc.ClientCrewID
//       WHERE cc.flag = 1
//       ORDER BY cc.ClientCrewID DESC
//       LIMIT 100
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

// /* ---------------------------------------------------------
//    GET /passengers   →  Passengers
// --------------------------------------------------------- */
// export const getPassengers = async (req, res, next) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT DISTINCT
//         cp.ClientPassengerID            AS ClientPassengerID,
//         srp.ServiceRequestPassengerID   AS ServiceRequestPassengerID,
//         cp.ClientPassengerName          AS ClientPassengerName,
//         cp.ClientPassengerEmailID       AS ClientPassengerEmailID,
//         cp.ClientPassengerContactNo     AS ClientPassengerContactNo,
//         cp.ClientPassengerNationality   AS ClientPassengerNationality,
//         cp.ClientPassengerPassport      AS ClientPassengerPassport,
//         cp.Gender                       AS Gender,
//         cp.status                       AS status,
//         cp.ClientID                     AS ClientID
//       FROM client_passengers cp
//       LEFT JOIN service_request_passengers srp
//         ON srp.ClientPassengerID = cp.ClientPassengerID
//       WHERE cp.flag = 1
//       ORDER BY cp.ClientPassengerID DESC
//       LIMIT 100
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

// /* ---------------------------------------------------------
//    GET /crew/:id   →  Single crew detail
// --------------------------------------------------------- */
// export const getCrewById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const [rows] = await pool.query(
//       `
//       SELECT
//         ClientCrewID,
//         ClientID,
//         ClientCrewName,
//         ClientCrewImageURL,
//         ClientCrewContactNo,
//         ClientCrewEmailID,
//         ClientCrewDob,
//         ClientCrewNationality,
//         ClientCrewPassport,
//         PassportRegistered,
//         PassportExpiry,
//         Duties,
//         Gender,
//         callingCodes,
//         status
//       FROM client_crew
//       WHERE ClientCrewID = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         success: false,
//         message: "Crew member not found",
//       });
//     }

//     res.status(200).json({ success: true, data: rows[0] });
//   } catch (error) {
//     next(error);
//   }
// };

// /* ---------------------------------------------------------
//    GET /passengers/:id   →  Single passenger detail
// --------------------------------------------------------- */
// export const getPassengerById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const [rows] = await pool.query(
//       `
//       SELECT
//         ClientPassengerID,
//         ClientID,
//         ClientPassengerName,
//         ClientPassengerImageURL,
//         ClientPassengerContactNo,
//         ClientPassengerEmailID,
//         ClientPassengerDob,
//         ClientPassengerNationality,
//         ClientPassengerPassport,
//         PassportRegistered,
//         PassportExpiry,
//         Gender,
//         callingCodes,
//         status
//       FROM client_passengers
//       WHERE ClientPassengerID = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         success: false,
//         message: "Passenger not found",
//       });
//     }

//     res.status(200).json({ success: true, data: rows[0] });
//   } catch (error) {
//     next(error);
//   }
// };

import pool from "../config/db.js";

/* ---------------------------------------------------------
   GET /crew   →  Crew list (sirf 2026)
--------------------------------------------------------- */
export const getCrew = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        cc.ClientCrewID             AS ClientCrewID,
        src.ServiceRequestCrewID    AS ServiceRequestCrewID,
        cc.ClientCrewName           AS ClientCrewName,
        cc.Duties                   AS Duties,
        cc.ClientCrewPassport       AS ClientCrewPassport,
        cc.ClientCrewContactNo      AS ClientCrewContactNo,
        cc.ClientCrewEmailID        AS ClientCrewEmailID,
        cc.ClientCrewNationality    AS ClientCrewNationality,
        cc.Gender                   AS Gender,
        cc.status                   AS status,
        cc.ClientID                 AS ClientID
      FROM client_crew cc
      INNER JOIN service_request_crew src
        ON src.ClientCrewID = cc.ClientCrewID
      INNER JOIN service_request sr
        ON sr.SRID = src.SRID
      WHERE cc.flag = 1
        AND YEAR(sr.DateCreated) = 2026
      ORDER BY cc.ClientCrewID DESC
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
   GET /passengers   →  Passenger list (sirf 2026)
--------------------------------------------------------- */
export const getPassengers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        cp.ClientPassengerID            AS ClientPassengerID,
        srp.ServiceRequestPassengerID   AS ServiceRequestPassengerID,
        cp.ClientPassengerName          AS ClientPassengerName,
        cp.ClientPassengerEmailID       AS ClientPassengerEmailID,
        cp.ClientPassengerContactNo     AS ClientPassengerContactNo,
        cp.ClientPassengerNationality   AS ClientPassengerNationality,
        cp.ClientPassengerPassport      AS ClientPassengerPassport,
        cp.Gender                       AS Gender,
        cp.status                       AS status,
        cp.ClientID                     AS ClientID
      FROM client_passengers cp
      INNER JOIN service_request_passengers srp
        ON srp.ClientPassengerID = cp.ClientPassengerID
      INNER JOIN service_request sr
        ON sr.SRID = srp.SRID
      WHERE cp.flag = 1
        AND YEAR(sr.DateCreated) = 2026
      ORDER BY cp.ClientPassengerID DESC
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
   GET /crew/:id   →  Detail (NO CHANGE)
--------------------------------------------------------- */
export const getCrewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Pehle ServiceRequestCrewID se try karo (kyunki frontend ye bhejta hai)
    let [rows] = await pool.query(
      `
      SELECT DISTINCT
        cc.ClientCrewID,
        cc.ClientID,
        cc.ClientCrewName,
        cc.ClientCrewImageURL,
        cc.ClientCrewContactNo,
        cc.ClientCrewEmailID,
        cc.ClientCrewDob,
        cc.ClientCrewNationality,
        cc.ClientCrewPassport,
        cc.PassportRegistered,
        cc.PassportExpiry,
        cc.Duties,
        cc.Gender,
        cc.callingCodes,
        cc.status
      FROM client_crew cc
      INNER JOIN service_request_crew src
        ON src.ClientCrewID = cc.ClientCrewID
      INNER JOIN service_request sr
        ON sr.SRID = src.SRID
      WHERE cc.flag = 1
        AND YEAR(sr.DateCreated) = 2026
        AND (
          src.ServiceRequestCrewID = ?
          OR cc.ClientCrewID = ?
        )
      LIMIT 1
      `,
      [id, id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Crew member not found for 2026",
      });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

/* ---------------------------------------------------------
   GET /passengers/:id   →  Detail (NO CHANGE)
--------------------------------------------------------- */
export const getPassengerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT DISTINCT
        cp.ClientPassengerID,
        cp.ClientID,
        cp.ClientPassengerName,
        cp.ClientPassengerImageURL,
        cp.ClientPassengerContactNo,
        cp.ClientPassengerEmailID,
        cp.ClientPassengerDob,
        cp.ClientPassengerNationality,
        cp.ClientPassengerPassport,
        cp.PassportRegistered,
        cp.PassportExpiry,
        cp.Gender,
        cp.callingCodes,
        cp.status
      FROM client_passengers cp
      INNER JOIN service_request_passengers srp
        ON srp.ClientPassengerID = cp.ClientPassengerID
      INNER JOIN service_request sr
        ON sr.SRID = srp.SRID
      WHERE cp.flag = 1
        AND YEAR(sr.DateCreated) = 2026
        AND (
          srp.ServiceRequestPassengerID = ?
          OR cp.ClientPassengerID = ?
        )
      LIMIT 1
      `,
      [id, id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found for 2026",
      });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};