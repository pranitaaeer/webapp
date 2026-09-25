import express from "express";

import {
  getDashboardSummary,
} from "../controllers/dashboard.controller.js";

import {
  getFlightRequests,
} from "../controllers/flight.controller.js";

import {
  getAircraft,
} from "../controllers/aircraft.controller.js";

import {
  getCrew,
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

router.get("/flight-requests", getFlightRequests);

router.get("/aircraft", getAircraft);

router.get("/crew", getCrew);

router.get("/passengers", getPassengers);

export default router;