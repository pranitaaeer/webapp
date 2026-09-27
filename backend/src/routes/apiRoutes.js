import express from "express";

import {
  getDashboardSummary,
  getRecentFlights,
} from "../controllers/dashboard.controller.js";

import {
  getFlightRequests,
  getFlightRequestById,
} from "../controllers/flight.controller.js";

import {
  getAircraft,
  getAircraftById,
} from "../controllers/aircraft.controller.js";

import {
  getCrew,
  getCrewById,
  getPassengerById,
  getPassengers,
} from "../controllers/people.controller.js";


const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/recent-flights", getRecentFlights);

router.get("/flight-requests", getFlightRequests);

router.get("/aircraft", getAircraft);
router.get("/aircraft/:id", getAircraftById);

router.get("/crew", getCrew);
router.get("/crew/:id", getCrewById);

router.get("/passengers", getPassengers);
router.get("/passengers/:id", getPassengerById);

router.get("/flight-requests", getFlightRequests);

router.get("/flight-requests/:id", getFlightRequestById);

export default router;