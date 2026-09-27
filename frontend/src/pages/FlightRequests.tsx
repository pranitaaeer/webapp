

import { useEffect, useMemo, useState } from "react";
import "../style/FlightRequests.css";
import { api } from "../services/api";
import Loader from "../components/Loader";

type FlightStatus =
  | "Processing"
  | "Confirmed"
  | "Active"
  | "Closed"
  | "Declined";

type FlightRequest = {
  id: string;
  client: string;
  from: string;
  to: string;
  date: string;
  aircraft: string;
  passengers: number;
  status: FlightStatus;
};

type ApiFlight = Record<string, unknown>;

type FlightDetailLeg = {
  SRSecID?: number;
  SectorFrom?: string;
  SectorTo?: string;
  Legstage?: string;
  LegOrderTripwise?: number;
  Stoptype?: string;
  DateCreated?: string;
};

type FlightDetail = {
  SRID?: number;
  Status?: string;
  ClientName?: string;
  AircraftName?: string;
  AircraftType?: string;
  DateCreated?: string;
  WayType?: string;
  FlightRule?: string;
  FlightType?: string;
  Operation?: string;
  legs?: FlightDetailLeg[];
  passengerCount?: number;
};

const statusOptions = [
  "All Status",
  "Processing",
  "Confirmed",
  "Active",
  "Closed",
  "Declined",
];

/* ---------- helpers ---------- */

const getValue = (
  row: ApiFlight,
  keys: string[],
  fallback = ""
): string => {
  for (const key of keys) {
    const value = row[key];

    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }

  return fallback;
};

const getNumber = (row: ApiFlight, keys: string[]): number => {
  const value = getValue(row, keys, "0");
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normalizeStatus = (value: string): FlightStatus => {
  const status = value.toLowerCase();

  if (status.includes("confirm")) return "Confirmed";
  if (status.includes("active")) return "Active";

  if (status.includes("closed") || status.includes("complete")) {
    return "Closed";
  }

  if (status.includes("declin") || status.includes("reject")) {
    return "Declined";
  }

  return "Processing";
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildAircraftLabel = (
  registration?: string,
  type?: string
): string => {
  if (registration && type) return `${registration} (${type})`;
  return registration || type || "—";
};

const mapFlight = (row: ApiFlight): FlightRequest => {
  const id = getValue(row, ["SRID", "ServiceRequestID", "id"], "N/A");

  const registration = getValue(
    row,
    ["AircraftName", "Registration"],
    ""
  );
  const type = getValue(row, ["AircraftType"], "");

  return {
    id: id === "N/A" ? id : `SR-${id}`,
    client: getValue(row, ["ClientName", "client_name", "Client"], "—"),
    from: getValue(row, ["FromAirport", "Origin", "from"], "—"),
    to: getValue(row, ["ToAirport", "Destination", "to"], "—"),
    date: formatDate(
      getValue(row, ["FlightDate", "DepartureDate", "date"], "")
    ),
    aircraft: buildAircraftLabel(registration, type),
    passengers: getNumber(row, [
      "PassengerCount",
      "Passengers",
      "passengers",
    ]),
    status: normalizeStatus(
      getValue(row, ["Status", "RequestStatus", "status"], "Processing")
    ),
  };
};

/* ---------- component ---------- */

export default function FlightRequests() {
  const [flightRequests, setFlightRequests] = useState<FlightRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  const [selectedFlight, setSelectedFlight] =
    useState<FlightRequest | null>(null);

  const [details, setDetails] = useState<FlightDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  /* ---------- fetch list ---------- */
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.getFlightRequests();

        const result = response as
          | ApiFlight[]
          | { data?: ApiFlight[]; requests?: ApiFlight[] };

        const rows = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.requests)
              ? result.requests
              : [];

        setFlightRequests(rows.map(mapFlight));
      } catch (err) {
        console.error("Flight requests API error:", err);
        setError(
          "Flight requests load nahi ho paaye. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  /* ---------- fetch single detail ---------- */
  const openDetails = async (flight: FlightRequest) => {
    setSelectedFlight(flight);
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);

    const rawId = flight.id.replace(/^SR-/, "");

    try {
      const res = await api.getFlightRequestById(rawId);

      const payload =
        (res as { data?: FlightDetail }).data ?? (res as FlightDetail);

      setDetails(payload);
    } catch (err) {
      console.error("Flight detail API error:", err);
      setDetailsError("Details load nahi ho paayi.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedFlight(null);
    setDetails(null);
    setDetailsError("");
  };

  /* ---------- search + filter ---------- */
  const filteredFlights = useMemo(() => {
    return flightRequests.filter((flight) => {
      const query = search.toLowerCase().trim();

      const matchesSearch = [
        flight.id,
        flight.client,
        flight.from,
        flight.to,
        flight.aircraft,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        status === "All Status" || flight.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [flightRequests, search, status]);

  const processingCount = flightRequests.filter(
    (f) => f.status === "Processing"
  ).length;

  const confirmedCount = flightRequests.filter(
    (f) => f.status === "Confirmed"
  ).length;

  const activeCount = flightRequests.filter(
    (f) => f.status === "Active"
  ).length;

  return (
    <div className="fr-page">
      {/* Header */}
      <div className="fr-header">
        <div>
          <div className="fr-breadcrumb">
            Operations <span>/</span> Flight Requests
          </div>

          <h1>Flight Requests</h1>

          <p>
            Manage and track all your flight requests in one place.
          </p>
        </div>

        <button
          className="fr-primary-btn"
          onClick={() =>
            alert("New Flight Request form will be added next.")
          }
        >
          <span>＋</span> New Flight Request
        </button>
      </div>

      {/* Stats */}
      <div className="fr-stats">
        <div className="fr-stat-card">
          <span className="fr-stat-label">Total Requests</span>
          <strong>{flightRequests.length}</strong>
          <span className="fr-stat-note">All flight requests</span>
        </div>

        <div className="fr-stat-card">
          <span className="fr-stat-label">Processing</span>
          <strong>{processingCount}</strong>
          <span className="fr-stat-note">Awaiting confirmation</span>
        </div>

        <div className="fr-stat-card">
          <span className="fr-stat-label">Confirmed</span>
          <strong>{confirmedCount}</strong>
          <span className="fr-stat-note">Ready for operation</span>
        </div>

        <div className="fr-stat-card">
          <span className="fr-stat-label">Active Flights</span>
          <strong>{activeCount}</strong>
          <span className="fr-stat-note">Currently in operation</span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="fr-table-card">
        <div className="fr-table-heading">
          <div>
            <h2>All Requests</h2>
            <p>View and manage your flight requests.</p>
          </div>

          <span className="fr-count">
            {filteredFlights.length} requests
          </span>
        </div>

        {/* Search and Filter */}
        <div className="fr-toolbar">
          <div className="fr-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by ID, client, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <p className="fr-loading"><Loader /></p>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="fr-error">
            <p>{error}</p>

            <button
              className="fr-view-btn"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="fr-table-wrap">
            <table className="fr-table">
              <thead>
                <tr>
                  <th>REQUEST ID</th>
                  <th>CLIENT</th>
                  <th>ROUTE</th>
                  <th>FLIGHT DATE</th>
                  <th>AIRCRAFT</th>
                  <th>PASSENGERS</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredFlights.map((flight) => (
                  <tr key={flight.id}>
                    <td>
                      <button
                        className="fr-id-btn"
                        onClick={() => openDetails(flight)}
                      >
                        {flight.id}
                      </button>
                    </td>

                    <td className="fr-client">{flight.client}</td>

                    <td>
                      <div className="fr-route">
                        <span>{flight.from}</span>
                        <span className="fr-route-arrow">→</span>
                        <span>{flight.to}</span>
                      </div>
                    </td>

                    <td>{flight.date}</td>
                    <td>{flight.aircraft}</td>
                    <td>{flight.passengers} pax</td>

                    <td>
                      <span
                        className={`fr-status fr-status-${flight.status.toLowerCase()}`}
                      >
                        <span className="fr-status-dot" />
                        {flight.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="fr-view-btn"
                        onClick={() => openDetails(flight)}
                      >
                        View ↗
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredFlights.length === 0 && (
                  <tr>
                    <td colSpan={8} className="fr-empty">
                      No flight requests found.
                      <button
                        onClick={() => {
                          setSearch("");
                          setStatus("All Status");
                        }}
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && (
          <div className="fr-table-footer">
            Showing {filteredFlights.length} of {flightRequests.length}{" "}
            requests
          </div>
        )}
      </div>

      {/* ---------------- Flight Details Modal ---------------- */}
      {selectedFlight && (
        <div className="fr-modal-backdrop" onClick={closeDetails}>
          <div
            className="fr-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fr-modal-header">
              <div>
                <span className="fr-modal-eyebrow">
                  REQUEST DETAILS
                </span>

                <h2>{selectedFlight.id}</h2>
              </div>

              <button
                className="fr-close-btn"
                onClick={closeDetails}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="fr-modal-body">
              {detailsLoading && (
                <p className="fr-loading">Loading details...</p>
              )}

              {!detailsLoading && detailsError && (
                <div className="fr-error">
                  <p>{detailsError}</p>
                </div>
              )}

              {!detailsLoading && !detailsError && (
                <>
                  <div className="fr-detail-row">
                    <span>Client</span>
                    <strong>
                      {details?.ClientName ??
                        selectedFlight.client ??
                        "—"}
                    </strong>
                  </div>

                  <div className="fr-detail-row">
                    <span>Flight route</span>
                    <strong>
                      {details?.legs?.[0]?.SectorFrom ??
                        selectedFlight.from}{" "}
                      →{" "}
                      {details?.legs?.[0]?.SectorTo ??
                        selectedFlight.to}
                    </strong>
                  </div>

                  <div className="fr-detail-row">
                    <span>Flight date</span>
                    <strong>
                      {details?.legs?.[0]?.DateCreated
                        ? formatDate(details.legs[0].DateCreated)
                        : selectedFlight.date}
                    </strong>
                  </div>

                  <div className="fr-detail-row">
                    <span>Aircraft</span>
                    <strong>
                      {details?.AircraftName
                        ? buildAircraftLabel(
                            details.AircraftName,
                            details.AircraftType
                          )
                        : selectedFlight.aircraft ?? "—"}
                    </strong>
                  </div>

                  <div className="fr-detail-row">
                    <span>Passengers</span>
                    <strong>
                      {details?.passengerCount ??
                        selectedFlight.passengers ??
                        0}
                    </strong>
                  </div>

                  <div className="fr-detail-row">
                    <span>Status</span>
                    <strong>
                      {details?.Status ?? selectedFlight.status}
                    </strong>
                  </div>

                  {details?.WayType && (
                    <div className="fr-detail-row">
                      <span>Trip type</span>
                      <strong>{details.WayType}</strong>
                    </div>
                  )}

                  {details?.FlightRule && (
                    <div className="fr-detail-row">
                      <span>Flight rule</span>
                      <strong>{details.FlightRule}</strong>
                    </div>
                  )}

                  {details?.Operation && (
                    <div className="fr-detail-row">
                      <span>Operation</span>
                      <strong>{details.Operation}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              className="fr-primary-btn fr-modal-done"
              onClick={closeDetails}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}