
import { useEffect, useMemo, useState } from "react";
import "../style/FlightRequests.css";
import { api } from "../services/api";

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

const statusOptions = [
  "All Status",
  "Processing",
  "Confirmed",
  "Active",
  "Closed",
  "Declined",
];

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

const getNumber = (
  row: ApiFlight,
  keys: string[]
): number => {
  const value = getValue(row, keys, "0");
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normalizeStatus = (value: string): FlightStatus => {
  const status = value.toLowerCase();

  if (status.includes("confirm")) return "Confirmed";
  if (status.includes("active")) return "Active";

  if (
    status.includes("closed") ||
    status.includes("complete")
  ) {
    return "Closed";
  }

  if (
    status.includes("declin") ||
    status.includes("reject")
  ) {
    return "Declined";
  }

  return "Processing";
};

const mapFlight = (row: ApiFlight): FlightRequest => {
  const id = getValue(
    row,
    ["SRID", "ServiceRequestID", "id"],
    "N/A"
  );

  return {
    id: id === "N/A" ? id : `SR-${id}`,
    client: getValue(
      row,
      ["ClientName", "client_name", "Client"],
      "—"
    ),
    from: getValue(
      row,
      ["FromAirport", "Origin", "from"],
      "—"
    ),
    to: getValue(
      row,
      ["ToAirport", "Destination", "to"],
      "—"
    ),
    date: getValue(
      row,
      ["FlightDate", "DepartureDate", "date"],
      "—"
    ),
    aircraft: getValue(
      row,
      ["AircraftName", "AircraftType", "aircraft"],
      "—"
    ),
    passengers: getNumber(
      row,
      ["PassengerCount", "Passengers", "passengers"]
    ),
    status: normalizeStatus(
      getValue(
        row,
        ["Status", "RequestStatus", "status"],
        "Processing"
      )
    ),
  };
};

export default function FlightRequests() {
  const [flightRequests, setFlightRequests] = useState<
    FlightRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  const [selectedFlight, setSelectedFlight] =
    useState<FlightRequest | null>(null);

  // Fetch flight requests from backend
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.getFlightRequests();

        const result = response as
          | ApiFlight[]
          | {
              data?: ApiFlight[];
              requests?: ApiFlight[];
            };

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

  // Search and status filter
  const filteredFlights = useMemo(() => {
    return flightRequests.filter((flight) => {
      const query = search.toLowerCase().trim();

      const matchesSearch = [
        flight.id,
        flight.client,
        flight.from,
        flight.to,
        flight.aircraft,
      ].some((value) =>
        value.toLowerCase().includes(query)
      );

      const matchesStatus =
        status === "All Status" || flight.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [flightRequests, search, status]);

  const processingCount = flightRequests.filter(
    (flight) => flight.status === "Processing"
  ).length;

  const confirmedCount = flightRequests.filter(
    (flight) => flight.status === "Confirmed"
  ).length;

  const activeCount = flightRequests.filter(
    (flight) => flight.status === "Active"
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
          <span className="fr-stat-note">
            All flight requests
          </span>
        </div>

        <div className="fr-stat-card">
          <span className="fr-stat-label">Processing</span>
          <strong>{processingCount}</strong>
          <span className="fr-stat-note">
            Awaiting confirmation
          </span>
        </div>

        <div className="fr-stat-card">
          <span className="fr-stat-label">Confirmed</span>
          <strong>{confirmedCount}</strong>
          <span className="fr-stat-note">
            Ready for operation
          </span>
        </div>

        <div className="fr-stat-card">
          <span className="fr-stat-label">Active Flights</span>
          <strong>{activeCount}</strong>
          <span className="fr-stat-note">
            Currently in operation
          </span>
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
          <p className="fr-loading">
            Loading flight requests...
          </p>
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
                        onClick={() => setSelectedFlight(flight)}
                      >
                        {flight.id}
                      </button>
                    </td>

                    <td className="fr-client">
                      {flight.client}
                    </td>

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
                        onClick={() => setSelectedFlight(flight)}
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
            Showing {filteredFlights.length} of{" "}
            {flightRequests.length} requests
          </div>
        )}
      </div>

      {/* Flight Details Modal */}
      {selectedFlight && (
        <div
          className="fr-modal-backdrop"
          onClick={() => setSelectedFlight(null)}
        >
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
                onClick={() => setSelectedFlight(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="fr-modal-body">
              <div className="fr-detail-row">
                <span>Client</span>
                <strong>{selectedFlight.client}</strong>
              </div>

              <div className="fr-detail-row">
                <span>Flight route</span>
                <strong>
                  {selectedFlight.from} → {selectedFlight.to}
                </strong>
              </div>

              <div className="fr-detail-row">
                <span>Flight date</span>
                <strong>{selectedFlight.date}</strong>
              </div>

              <div className="fr-detail-row">
                <span>Aircraft</span>
                <strong>{selectedFlight.aircraft}</strong>
              </div>

              <div className="fr-detail-row">
                <span>Passengers</span>
                <strong>{selectedFlight.passengers}</strong>
              </div>

              <div className="fr-detail-row">
                <span>Status</span>
                <strong>{selectedFlight.status}</strong>
              </div>
            </div>

            <button
              className="fr-primary-btn fr-modal-done"
              onClick={() => setSelectedFlight(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}