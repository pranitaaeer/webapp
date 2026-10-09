
// import pool from "../config/db.js";

// export const getAircraft = async (req, res, next) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT
//         AircraftID              AS AircraftID,
//         Registration            AS Registration,
//         AircraftManfacturer     AS Manufacturer,
//         AircraftType            AS AircraftType,
//         AircaftCategory         AS AircraftCategory,
//         NoOfPaxCapacity         AS PassengerCapacity,
//         NoOfCrewCapacity        AS CrewCapacity,
//         SEDistance              AS FlightRange,
//         BaseLocation            AS BaseLocation,
//         MFCapacity              AS FuelCapacity,
//         MaxPaxSeats             AS MaxPaxSeats,
//         ACICAOcode              AS ICAOCode,
//         EngineType              AS EngineType,
//         CharterStatus           AS CharterStatus
//       FROM aircraft
//       WHERE DeleteFlag = 0
//       ORDER BY AircraftID DESC
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

// export const getAircraftById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const [rows] = await pool.query(
//       `
//       SELECT
//         AircraftID,
//         Registration,
//         AircraftManfacturer,
//         AircraftType,
//         AircaftCategory,
//         OperationType,
//         MTOWeight,
//         UnitType,
//         CruiseSpeed,
//         EngineType,
//         FuelType,
//         NoOfPaxCapacity,
//         NoOfCrewCapacity,
//         MaxPaxSeats,
//         SEDistance,
//         MFCapacity,
//         BaseLocation,
//         ACICAOcode,
//         OPSRegulation,
//         Carbonoffset,
//         EtopsEnable
//       FROM aircraft
//       WHERE AircraftID = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         success: false,
//         message: "Aircraft not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: rows[0],
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import pool from "../config/db.js";

/* ---------------------------------------------------------
   GET /aircraft   →  List (sirf 2026 me use hue aircraft)
--------------------------------------------------------- */
export const getAircraft = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        a.AircraftID            AS AircraftID,
        a.Registration          AS Registration,
        a.AircraftManfacturer   AS Manufacturer,
        a.AircraftType          AS AircraftType,
        a.AircaftCategory       AS AircraftCategory,
        a.NoOfPaxCapacity       AS PassengerCapacity,
        a.NoOfCrewCapacity      AS CrewCapacity,
        a.SEDistance            AS FlightRange,
        a.BaseLocation          AS BaseLocation,
        a.MFCapacity            AS FuelCapacity,
        a.MaxPaxSeats           AS MaxPaxSeats,
        a.ACICAOcode            AS ICAOCode,
        a.EngineType            AS EngineType,
        a.CharterStatus         AS CharterStatus
      FROM aircraft a
      INNER JOIN service_request sr
        ON sr.AircraftID = a.AircraftID
      WHERE a.DeleteFlag = 0
        AND YEAR(sr.DateCreated) = 2026
      ORDER BY a.AircraftID DESC
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
   GET /aircraft/:id   →  Detail (NO CHANGE)
--------------------------------------------------------- */
export const getAircraftById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        a.AircraftID,
        a.Registration,
        a.AircraftManfacturer,
        a.AircraftType,
        a.AircaftCategory,
        a.OperationType,
        a.MTOWeight,
        a.UnitType,
        a.CruiseSpeed,
        a.EngineType,
        a.FuelType,
        a.NoOfPaxCapacity,
        a.NoOfCrewCapacity,
        a.MaxPaxSeats,
        a.SEDistance,
        a.MFCapacity,
        a.BaseLocation,
        a.ACICAOcode,
        a.OPSRegulation,
        a.Carbonoffset,
        a.EtopsEnable,
        ad.CharterPrice,
        ad.CharterCost
      FROM aircraft a
      LEFT JOIN aircraft_data ad
        ON ad.AircraftID = a.AircraftID
       AND ad.AircraftDataID = (
         SELECT MAX(AircraftDataID)
         FROM aircraft_data
         WHERE AircraftID = a.AircraftID
       )
      WHERE a.AircraftID = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Aircraft not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};