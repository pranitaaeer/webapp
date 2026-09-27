
import pool from "../config/db.js";

export const getAircraft = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        AircraftID              AS AircraftID,
        Registration            AS Registration,
        AircraftManfacturer     AS Manufacturer,
        AircraftType            AS AircraftType,
        AircaftCategory         AS AircraftCategory,
        NoOfPaxCapacity         AS PassengerCapacity,
        NoOfCrewCapacity        AS CrewCapacity,
        SEDistance              AS FlightRange,
        BaseLocation            AS BaseLocation,
        MFCapacity              AS FuelCapacity,
        MaxPaxSeats             AS MaxPaxSeats,
        ACICAOcode              AS ICAOCode,
        EngineType              AS EngineType,
        CharterStatus           AS CharterStatus
      FROM aircraft
      WHERE DeleteFlag = 0
      ORDER BY AircraftID DESC
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

export const getAircraftById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        AircraftID,
        Registration,
        AircraftManfacturer,
        AircraftType,
        AircaftCategory,
        OperationType,
        MTOWeight,
        UnitType,
        CruiseSpeed,
        EngineType,
        FuelType,
        NoOfPaxCapacity,
        NoOfCrewCapacity,
        MaxPaxSeats,
        SEDistance,
        MFCapacity,
        BaseLocation,
        ACICAOcode,
        OPSRegulation,
        Carbonoffset,
        EtopsEnable
      FROM aircraft
      WHERE AircraftID = ?
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