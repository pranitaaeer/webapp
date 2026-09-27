

import pool from "../config/db.js";


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
      LEFT JOIN service_request_crew src
        ON src.ClientCrewID = cc.ClientCrewID
      WHERE cc.flag = 1
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
   GET /passengers   →  Passengers
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
      LEFT JOIN service_request_passengers srp
        ON srp.ClientPassengerID = cp.ClientPassengerID
      WHERE cp.flag = 1
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
   GET /crew/:id   →  Single crew detail
--------------------------------------------------------- */
export const getCrewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        ClientCrewID,
        ClientID,
        ClientCrewName,
        ClientCrewImageURL,
        ClientCrewContactNo,
        ClientCrewEmailID,
        ClientCrewDob,
        ClientCrewNationality,
        ClientCrewPassport,
        PassportRegistered,
        PassportExpiry,
        Duties,
        Gender,
        callingCodes,
        status
      FROM client_crew
      WHERE ClientCrewID = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Crew member not found",
      });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

/* ---------------------------------------------------------
   GET /passengers/:id   →  Single passenger detail
--------------------------------------------------------- */
export const getPassengerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        ClientPassengerID,
        ClientID,
        ClientPassengerName,
        ClientPassengerImageURL,
        ClientPassengerContactNo,
        ClientPassengerEmailID,
        ClientPassengerDob,
        ClientPassengerNationality,
        ClientPassengerPassport,
        PassportRegistered,
        PassportExpiry,
        Gender,
        callingCodes,
        status
      FROM client_passengers
      WHERE ClientPassengerID = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};