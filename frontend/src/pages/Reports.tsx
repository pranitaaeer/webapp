import { useEffect, useMemo, useState } from "react";
import "../style/Reports.css";
import { api } from "../services/api";

type FlightStatus =
  | "Processing"
  | "Confirmed"
  | "Active"
  | "Completed"
  | "Cancelled"
  | "Other";

type Flight = {
  id: string;
  client: string;
  aircraft: string;
  route: string;
  from: string;
  to: string;
  date: string;
  status: FlightStatus;
  passengers: number;
};

type ApiFlight = {
  [key: string]: unknown;
};

type Period = "All Time" | "This Month" | "Last 6 Months" | "This Year";

type MonthlyFlight = {
  month: string;
  count: number;
};

type StatusCount = {
  status: FlightStatus;
  count: number;
};

const PERIOD_OPTIONS: Period[] = [
  "All Time",
  "This Month",
  "Last 6 Months",
  "This Year",
];

const STATUS_OPTIONS = [
  "All Status",
  "Processing",
  "Confirmed",
  "Active",
  "Completed",
  "Cancelled",
  "Other",
];

const getValue = (
  record: ApiFlight,
  keys: string[],
  fallback = ""
): string => {
  for (const key of keys) {
    const value = record[key];

    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }

  return fallback;
};

const getNumber = (
  record: ApiFlight,
  keys: string[],
  fallback = 0
): number => {
  for (const key of keys) {
    const value = record[key];

    if (value !== null && value !== undefined && value !== "") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
};

const normalizeStatus = (value: string): FlightStatus => {
  const status = value.trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (
    status.includes("cancel") ||
    status.includes("tripcancel") ||
    status.includes("quotecancel")
  ) {
    return "Cancelled";
  }

  if (
    status === "closed" ||
    status === "completed" ||
    status === "complete" ||
    status === "finished"
  ) {
    return "Completed";
  }

  if (
    status === "processing" ||
    status === "pending" ||
    status === "inprogress"
  ) {
    return "Processing";
  }

  if (
    status === "confirmed" ||
    status === "approved" ||
    status === "booked"
  ) {
    return "Confirmed";
  }

  if (
    status === "active" ||
    status === "inflight" ||
    status === "ongoing"
  ) {
    return "Active";
  }

  return "Other";
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const formatDate = (value: Date | null): string => {
  if (!value) return "—";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const mapFlight = (record: ApiFlight, index: number): Flight => {
  const id = getValue(
    record,
    ["SRID", "srid", "RequestID", "requestId", "ID", "id"],
    `Request-${index + 1}`
  );

  const client = getValue(
    record,
    ["ClientName", "clientName", "Client", "client", "ClientID", "clientId"],
    "Unknown Client"
  );

  const aircraft = getValue(
    record,
    [
      "AircraftName",
      "aircraftName",
      "Aircraft",
      "aircraft",
      "AircraftID",
      "aircraftId",
    ],
    "Not Assigned"
  );

  const from = getValue(
    record,
    [
      "From",
      "from",
      "Origin",
      "origin",
      "DepartureAirport",
      "departureAirport",
    ],
    ""
  );

  const to = getValue(
    record,
    [
      "To",
      "to",
      "Destination",
      "destination",
      "ArrivalAirport",
      "arrivalAirport",
    ],
    ""
  );

  const route =
    from && to
      ? `${from} → ${to}`
      : getValue(record, ["Route", "route"], "Route not available");

  const rawDate = getValue(
    record,
    [
      "FlightDate",
      "flightDate",
      "DateCreated",
      "dateCreated",
      "CreatedAt",
      "createdAt",
      "Date",
      "date",
    ],
    ""
  );

  const date = parseDate(rawDate);

  const status = normalizeStatus(
    getValue(record, ["Status", "status"], "Other")
  );

  const passengers = getNumber(
    record,
    [
      "PassengerCount",
      "passengerCount",
      "Passengers",
      "passengers",
      "Pax",
      "pax",
    ],
    0
  );

  return {
    id,
    client,
    aircraft,
    route,
    from,
    to,
    date: date ? date.toISOString() : "",
    status,
    passengers,
  };
};

const unwrapResponse = (response: unknown): ApiFlight[] => {
  if (Array.isArray(response)) {
    return response as ApiFlight[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const result = response as Record<string, unknown>;

  const body =
    result.data && typeof result.data === "object"
      ? (result.data as Record<string, unknown>)
      : result;

  if (Array.isArray(body)) {
    return body as ApiFlight[];
  }

  if (Array.isArray(body.data)) {
    return body.data as ApiFlight[];
  }

  if (Array.isArray(body.flightRequests)) {
    return body.flightRequests as ApiFlight[];
  }

  if (Array.isArray(body.records)) {
    return body.records as ApiFlight[];
  }

  return [];
};

const getPeriodStart = (period: Period): Date | null => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "All Time") {
    return null;
  }

  if (period === "This Month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (period === "Last 6 Months") {
    return new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }

  if (period === "This Year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return start;
};

const isInPeriod = (flight: Flight, period: Period): boolean => {
  if (period === "All Time") return true;

  if (!flight.date) return false;

  const date = new Date(flight.date);
  const start = getPeriodStart(period);

  if (!start) return true;

  const now = new Date();

  return date >= start && date <= now;
};

const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const getMonthLabel = (key: string): string => {
  const [year, month] = key.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

const downloadCSV = (flights: Flight[]) => {
  const headers = [
    "Request ID",
    "Client",
    "Aircraft",
    "Route",
    "Date",
    "Passengers",
    "Status",
  ];

  const rows = flights.map((flight) => [
    flight.id,
    flight.client,
    flight.aircraft,
    flight.route,
    formatDate(flight.date ? new Date(flight.date) : null),
    flight.passengers,
    flight.status,
  ]);

  const escapeCSV = (value: string | number) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `flight-report-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export default function Reports() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [period, setPeriod] = useState<Period>("All Time");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.getFlightRequests();
      const records = unwrapResponse(response);

      const normalizedFlights = records.map((record, index) =>
        mapFlight(record, index)
      );

      setFlights(normalizedFlights);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load flight reports.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const periodFlights = useMemo(() => {
    return flights.filter((flight) => isInPeriod(flight, period));
  }, [flights, period]);

  const filteredFlights = useMemo(() => {
    const query = search.trim().toLowerCase();

    return periodFlights.filter((flight) => {
      const matchesSearch =
        !query ||
        [
          flight.id,
          flight.client,
          flight.aircraft,
          flight.route,
          flight.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All Status" || flight.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [periodFlights, search, statusFilter]);

  const totalFlights = periodFlights.length;

  const completedFlights = periodFlights.filter(
    (flight) => flight.status === "Completed"
  ).length;

  const cancelledFlights = periodFlights.filter(
    (flight) => flight.status === "Cancelled"
  ).length;

  const activeFlights = periodFlights.filter(
    (flight) => flight.status === "Active"
  ).length;

  const processingFlights = periodFlights.filter(
    (flight) => flight.status === "Processing"
  ).length;

  const confirmedFlights = periodFlights.filter(
    (flight) => flight.status === "Confirmed"
  ).length;

  const totalPassengers = periodFlights.reduce(
    (sum, flight) => sum + flight.passengers,
    0
  );

  const statusCounts = useMemo<StatusCount[]>(() => {
    const statuses: FlightStatus[] = [
      "Processing",
      "Confirmed",
      "Active",
      "Completed",
      "Cancelled",
      "Other",
    ];

    return statuses.map((status) => ({
      status,
      count: periodFlights.filter((flight) => flight.status === status).length,
    }));
  }, [periodFlights]);

  const monthlyFlights = useMemo<MonthlyFlight[]>(() => {
    const counts = new Map<string, number>();

    periodFlights.forEach((flight) => {
      if (!flight.date) return;
      const key = getMonthKey(new Date(flight.date));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    // No data at all → empty state
    if (counts.size === 0) {
      return [];
    }

    // Sorted list of months that actually have data
    const dataKeys = Array.from(counts.keys()).sort((a, b) =>
      a.localeCompare(b)
    );

    const firstKey = dataKeys[0];
    const lastKey = dataKeys[dataKeys.length - 1];

    const [fy, fm] = firstKey.split("-").map(Number);
    const [ly, lm] = lastKey.split("-").map(Number);

    const firstDate = new Date(fy, fm - 1, 1);
    const lastDate = new Date(ly, lm - 1, 1);

    // Fill every month between the first and last data month
    const months: MonthlyFlight[] = [];
    const cursor = new Date(firstDate);

    while (cursor <= lastDate) {
      const key = getMonthKey(cursor);
      months.push({
        month: getMonthLabel(key),
        count: counts.get(key) ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // Pad with surrounding months if fewer than 6
    const MIN_MONTHS = 6;

    if (months.length < MIN_MONTHS) {
      const padCount = MIN_MONTHS - months.length;
      const padBefore = Math.floor(padCount / 2);
      const padAfter = padCount - padBefore;

      const padded: MonthlyFlight[] = [];

      // Months before the first data month
      for (let i = padBefore; i > 0; i--) {
        const d = new Date(firstDate);
        d.setMonth(d.getMonth() - i);
        const key = getMonthKey(d);
        padded.push({
          month: getMonthLabel(key),
          count: counts.get(key) ?? 0,
        });
      }

      padded.push(...months);

      // Months after the last data month
      for (let i = 1; i <= padAfter; i++) {
        const d = new Date(lastDate);
        d.setMonth(d.getMonth() + i);
        const key = getMonthKey(d);
        padded.push({
          month: getMonthLabel(key),
          count: counts.get(key) ?? 0,
        });
      }

      return padded;
    }

    return months;
  }, [periodFlights]);

  const aircraftData = useMemo(() => {
    const counts = new Map<string, number>();

    periodFlights.forEach((flight) => {
      const name = flight.aircraft || "Not Assigned";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [periodFlights]);

  const maxMonthlyCount = Math.max(
    1,
    ...monthlyFlights.map((item) => item.count)
  );

  const maxAircraftCount = Math.max(
    1,
    ...aircraftData.map((item) => item.count)
  );

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setPeriod("All Time");
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <div className="reports-breadcrumb">
            Analytics <span>/</span> Reports
          </div>
          <h1>Reports &amp; Analytics</h1>
          <p>Track flight requests, statuses, and aircraft usage.</p>
        </div>

        <div className="reports-header-actions">
          <button
            className="reports-secondary-btn"
            onClick={() => void fetchReports()}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <button
            className="reports-primary-btn"
            onClick={() => downloadCSV(filteredFlights)}
            disabled={filteredFlights.length === 0}
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      <div className="reports-toolbar">
        <div className="reports-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by request ID, client, aircraft..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value as Period)}
          aria-label="Filter reports by period"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter reports by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="reports-message">
          <div className="reports-loader" />
          <p>Loading flight reports...</p>
        </div>
      )}

      {!loading && error && (
        <div className="reports-error">
          <div>
            <strong>Unable to load reports</strong>
            <p>{error}</p>
          </div>

          <button
            className="reports-secondary-btn"
            onClick={() => void fetchReports()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="reports-stats">
            <div className="reports-stat-card">
              <div className="reports-stat-top">
                <span>Total Requests</span>
                <span className="reports-stat-icon blue">✈</span>
              </div>
              <strong>{totalFlights}</strong>
              <small>All requests in selected period</small>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-top">
                <span>Completed</span>
                <span className="reports-stat-icon green">✓</span>
              </div>
              <strong>{completedFlights}</strong>
              <small>Closed requests</small>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-top">
                <span>Processing</span>
                <span className="reports-stat-icon orange">◷</span>
              </div>
              <strong>{processingFlights}</strong>
              <small>Awaiting confirmation</small>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-top">
                <span>Confirmed</span>
                <span className="reports-stat-icon purple">✓</span>
              </div>
              <strong>{confirmedFlights}</strong>
              <small>Confirmed requests</small>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-top">
                <span>Active Flights</span>
                <span className="reports-stat-icon teal">↗</span>
              </div>
              <strong>{activeFlights}</strong>
              <small>Currently active</small>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-top">
                <span>Cancelled</span>
                <span className="reports-stat-icon red">×</span>
              </div>
              <strong>{cancelledFlights}</strong>
              <small>Cancelled requests</small>
            </div>
          </div>

          <div className="reports-chart-grid">
            <section className="reports-card">
              <div className="reports-card-heading">
                <div>
                  <h2>Monthly Flight Requests</h2>
                  <p>Requests grouped by creation month.</p>
                </div>
              </div>

              {monthlyFlights.length === 0 ? (
                <div className="reports-empty">
                  No date information available for this period.
                </div>
              ) : (
                <div className="reports-monthly-chart">
                  {monthlyFlights.map((item) => {
                    const isZero = item.count === 0;
                    const heightPercent = isZero
                      ? 4
                      : Math.max(8, (item.count / maxMonthlyCount) * 100);

                    return (
                      <div className="reports-month-item" key={item.month}>
                        <div
                          className={`reports-month-value ${
                            isZero ? "is-empty" : ""
                          }`}
                        >
                          {isZero ? "—" : item.count}
                        </div>

                        <div className="reports-bar-track">
                          <div
                            className={`reports-bar ${
                              isZero ? "empty" : ""
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        <span className="reports-month-label">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="reports-card">
              <div className="reports-card-heading">
                <div>
                  <h2>Flight Status Breakdown</h2>
                  <p>Request distribution by status.</p>
                </div>
              </div>

              <div className="reports-status-list">
                {statusCounts.map((item) => {
                  const percentage =
                    totalFlights > 0
                      ? Math.round((item.count / totalFlights) * 100)
                      : 0;

                  return (
                    <div className="reports-status-item" key={item.status}>
                      <div className="reports-status-info">
                        <span
                          className={`reports-status-dot reports-dot-${item.status.toLowerCase()}`}
                        />
                        <span>{item.status}</span>
                        <strong>{item.count}</strong>
                      </div>

                      <div className="reports-status-track">
                        <div
                          className={`reports-status-fill reports-fill-${item.status.toLowerCase()}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="reports-bottom-grid">
            <section className="reports-card">
              <div className="reports-card-heading">
                <div>
                  <h2>Aircraft Usage</h2>
                  <p>Requests grouped by aircraft identifier.</p>
                </div>
              </div>

              {aircraftData.length === 0 ? (
                <div className="reports-empty">
                  No aircraft data available.
                </div>
              ) : (
                <div className="reports-aircraft-list">
                  {aircraftData.map((item) => {
                    const percentage = Math.round(
                      (item.count / maxAircraftCount) * 100
                    );

                    return (
                      <div
                        className="reports-aircraft-item"
                        key={item.name}
                      >
                        <div className="reports-aircraft-info">
                          <span>✈ {item.name}</span>
                          <strong>{item.count}</strong>
                        </div>

                        <div className="reports-aircraft-track">
                          <div
                            className="reports-aircraft-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="reports-card reports-summary-card">
              <div className="reports-card-heading">
                <div>
                  <h2>Summary</h2>
                  <p>Overview of the selected period.</p>
                </div>
              </div>

              <div className="reports-summary-list">
                <div>
                  <span>Total requests</span>
                  <strong>{totalFlights}</strong>
                </div>

                <div>
                  <span>Total passengers</span>
                  <strong>{totalPassengers}</strong>
                </div>

                <div>
                  <span>Unique aircraft IDs</span>
                  <strong>{aircraftData.length}</strong>
                </div>

                <div>
                  <span>Cancelled requests</span>
                  <strong>{cancelledFlights}</strong>
                </div>
              </div>

              <p className="reports-note">
                Passenger totals are based only on passenger-count fields
                available in the API response. Missing values are treated as
                zero.
              </p>
            </section>
          </div>

          <section className="reports-card reports-table-card">
            <div className="reports-card-heading">
              <div>
                <h2>Flight Request Details</h2>
                <p>View the requests included in this report.</p>
              </div>

              <span className="reports-count">
                {filteredFlights.length} requests
              </span>
            </div>

            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>REQUEST ID</th>
                    <th>CLIENT</th>
                    <th>ROUTE</th>
                    <th>DATE</th>
                    <th>AIRCRAFT</th>
                    <th>PASSENGERS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFlights.map((flight) => (
                    <tr key={flight.id}>
                      <td>
                        <strong className="reports-request-id">
                          {flight.id}
                        </strong>
                      </td>
                      <td>{flight.client}</td>
                      <td>{flight.route}</td>
                      <td>
                        {flight.date
                          ? formatDate(new Date(flight.date))
                          : "—"}
                      </td>
                      <td>{flight.aircraft}</td>
                      <td>{flight.passengers || "—"}</td>
                      <td>
                        <span
                          className={`reports-status-badge reports-badge-${flight.status.toLowerCase()}`}
                        >
                          {flight.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredFlights.length === 0 && (
                    <tr>
                      <td colSpan={7} className="reports-empty-cell">
                        No flight requests found for the selected filters.
                        <button onClick={handleResetFilters}>
                          Reset filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="reports-table-footer">
              Showing {filteredFlights.length} of {periodFlights.length}{" "}
              requests
            </div>
          </section>
        </>
      )}
    </div>
  );
}