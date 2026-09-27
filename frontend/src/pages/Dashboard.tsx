


import { useEffect, useMemo, useState } from "react";
import FlightRequests from "./FlightRequests";
import "../App.css";
import Aircraft from "./Aircraft";
import CrewPassengers from "./CrewPassengers";
import Reports from "./Reports";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

type FlightStatus =
  | "Processing"
  | "Confirmed"
  | "Active"
  | "Closed"
  | "Declined";

type Flight = {
  id: string;
  route: string;
  from: string;
  to: string;
  aircraft: string;
  date: string;
  status: FlightStatus;
  passengers: number;
};

type DashboardSummary = {
  totalRequests: number;
  totalAircraft: number;
  totalCrew: number;
  totalPassengers: number;
};

const emptySummary: DashboardSummary = {
  totalRequests: 0,
  totalAircraft: 0,
  totalCrew: 0,
  totalPassengers: 0,
};

const navItems = [
  { name: "Dashboard", icon: "▦" },
  { name: "Flight Requests", icon: "✈" },
  { name: "Aircraft", icon: "◈" },
  { name: "Crew Management", icon: "♙" },
  { name: "Reports", icon: "▤" },
];

const statusClass: Record<FlightStatus, string> = {
  Processing: "processing",
  Confirmed: "confirmed",
  Active: "active",
  Closed: "closed",
  Declined: "declined",
};

const getValue = (
  row: Record<string, unknown>,
  keys: string[],
  fallback = "—"
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
  row: Record<string, unknown>,
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

  if (status.includes("closed") || status.includes("complete")) {
    return "Closed";
  }

  if (status.includes("declin") || status.includes("reject")) {
    return "Declined";
  }

  // ✅ NAYA: Quotecancelled / Tripcancelled ko Declined banao
  if (status.includes("cancel") || status.includes("fire")) {
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

const mapFlightRow = (row: Record<string, unknown>): Flight => {
  const id = getValue(row, ["SRID"], "N/A");
  const from = getValue(row, ["FromAirport"], "—");
  const to = getValue(row, ["ToAirport"], "—");
  const aircraft = getValue(row, ["AircraftName"], "");
  const type = getValue(row, ["AircraftType"], "");

  return {
    id: id === "N/A" ? id : `SR-${id}`,
    route: `${from} → ${to}`,
    from,
    to,
    aircraft: aircraft && type ? `${aircraft} (${type})` : aircraft || type || "—",
    date: formatDate(
      getValue(row, ["FlightDate", "DateCreated"], "")
    ),
    status: normalizeStatus(
      getValue(row, ["Status"], "Processing")
    ),
    passengers: getNumber(row, ["PassengerCount"]),
  };
};

function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [, setFlightsLoading] = useState(true);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const [deleteFlight, setDeleteFlight] = useState<Flight | null>(null);

  const [summary, setSummary] =
    useState<DashboardSummary>(emptySummary);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("avplat_demo_logged_in");
    navigate("/login");
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setApiError("");

        const [summaryRes, flightsRes] = await Promise.all([
          api.getDashboard() as Promise<{
            success: boolean;
            data: DashboardSummary;
          }>,
          api.getRecentFlights() as Promise<{
            success: boolean;
            data: Record<string, unknown>[];
          }>,
        ]);

        if (!summaryRes.success) {
          throw new Error("Failed to load dashboard data");
        }

        setSummary(summaryRes.data);

        const rows = Array.isArray(flightsRes.data)
          ? flightsRes.data
          : [];

        setFlights(rows.map(mapFlightRow));
      } catch (error) {
        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
        setFlightsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      const matchesSearch = [
        flight.id,
        flight.route,
        flight.from,
        flight.to,
        flight.aircraft,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || flight.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
    // ✅ FIX: flights dependency add ki
  }, [flights, search, statusFilter]);

  // Stats from backend
  const stats = [
    {
      label: "Total Flights",
      value: summary.totalRequests,
      icon: "✈",
      color: "blue",
      note: "All service requests",
    },
    {
      label: "Total Aircraft",
      value: summary.totalAircraft,
      icon: "↗",
      color: "green",
      note: "Registered aircraft",
    },
    {
      label: "Total Crew",
      value: summary.totalCrew,
      icon: "◷",
      color: "orange",
      note: "Crew assignment records",
    },
    {
      label: "Total Passengers",
      value: summary.totalPassengers,
      icon: "✓",
      color: "purple",
      note: "Passenger assignment records",
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h2>AVPLAT</h2>
            <span>AVIATION PLATFORM</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activeNav === item.name ? "selected" : ""
                }`}
              onClick={() => setActiveNav(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>

              {item.name === "Flight Requests" && (
                <span className="nav-count">
                  {summary.totalRequests}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon">?</div>
            <div>
              <strong>Need help?</strong>
              <p>Contact your administrator</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">AU</div>

            <div className="profile-info">
              <strong>Admin User</strong>
              <span>Administrator</span>
            </div>

            <div className="profile-menu-wrapper">
              <button
                type="button"
                className="profile-menu"
                aria-label="Profile menu"
                aria-expanded={showProfileMenu}
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                ⋯
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button
                    type="button"
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span>↪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="crumb-separator">/</span>
            <strong>{activeNav}</strong>
          </div>

          <div className="topbar-actions">
            <div className="system-status">
              <span className="status-dot" />
              System Online
            </div>

            <button
              className="icon-button"
              aria-label="Notifications"
            >
              ♧<span className="notification-dot" />
            </button>

            <div className="top-avatar">AU</div>
          </div>
        </header>

        <div className="page-content">
          {activeNav === "Flight Requests" ? (
            <FlightRequests />
          ) : activeNav === "Aircraft" ? (
            <Aircraft />
          ) : activeNav === "Crew Management" ||
            activeNav === "Passengers" ? (
            <CrewPassengers
              initialTab={
                activeNav === "Passengers"
                  ? "passengers"
                  : "crew"
              }
            />
          ) : activeNav === "Reports" ? (
            <Reports />
          ) : (
            <>
              <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    AVIATION OPERATIONS
                  </div>

                  <h1>
                    Good afternoon, Admin <span>✦</span>
                  </h1>

                  <p>
                    Here's what's happening with your flight
                    operations today.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    alert(
                      "New flight request form will be added next."
                    );
                  }}
                >
                  <span>+</span> New Flight Request
                </button>
              </section>

              {/* API Loading and Error */}
              {loading && (
                <p className="api-message">
                  <Loader />
                </p>
              )}

              {apiError && (
                <p className="api-error">{apiError}</p>
              )}

              {/* Dashboard Stats */}
              <section className="stats-grid">
                {stats.map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <div className="stat-top">
                      <span className="stat-label">
                        {stat.label}
                      </span>

                      <div className={`stat-icon ${stat.color}`}>
                        {stat.icon}
                      </div>
                    </div>

                    <div className="stat-value">
                      {loading ? "—" : stat.value}
                    </div>

                    <div className="stat-note">
                      <span
                        className={`note-dot ${stat.color}`}
                      />
                      {stat.note}
                    </div>
                  </div>
                ))}
              </section>

              {/* Flight Requests Table */}
              <section className="flight-section">
                <div className="section-heading">
                  <div>
                    <h2>Flight Requests</h2>
                    <p>
                      Manage and track your flight service
                      requests.
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                    }}
                  >
                    ↻ Reset filters
                  </button>
                </div>

                <div className="filter-bar">
                  <div className="search-box">
                    <span className="search-icon">⌕</span>

                    <input
                      type="text"
                      placeholder="Search flight, route, aircraft..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />

                    <span className="search-shortcut">
                      ⌘ K
                    </span>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    aria-label="Filter by status"
                  >
                    <option value="All">All statuses</option>
                    <option value="Processing">
                      Processing
                    </option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                <div className="table-wrapper">
                  <table className="flight-table">
                    <thead>
                      <tr>
                        <th>REQUEST ID</th>
                        <th>FLIGHT ROUTE</th>
                        <th>AIRCRAFT</th>
                        <th>DATE</th>
                        <th>PASSENGERS</th>
                        <th>STATUS</th>
                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFlights.map((flight) => (
                        <tr key={flight.id}>
                          <td>
                            <span className="flight-id">
                              {flight.id}
                            </span>
                          </td>

                          <td>
                            <div className="route-cell">
                              <div className="route-codes">
                                {flight.route}
                              </div>

                              <div className="route-cities">
                                {flight.from} → {flight.to}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="aircraft-cell">
                              <div className="aircraft-icon">
                                ✈
                              </div>
                              <span>{flight.aircraft}</span>
                            </div>
                          </td>

                          <td className="date-cell">
                            {flight.date}
                          </td>

                          <td>
                            <span className="passenger-count">
                              ♙ {flight.passengers}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${statusClass[flight.status]
                                }`}
                            >
                              <span className="badge-dot" />
                              {flight.status}
                            </span>
                          </td>

                          <td>
                            <div className="row-menu-wrapper">
                              <button
                                type="button"
                                className="row-menu"
                                aria-label={`Actions for ${flight.id}`}
                                aria-expanded={openRowMenu === flight.id}
                                onClick={() =>
                                  setOpenRowMenu((prev) =>
                                    prev === flight.id ? null : flight.id
                                  )
                                }
                              >
                                ⋯
                              </button>

                              {openRowMenu === flight.id && (
                                <div className="row-dropdown">
                                  <button
                                    type="button"
                                    className="row-dropdown-item"
                                    onClick={() => {
                                      setDeleteFlight(flight);
                                      setOpenRowMenu(null);
                                    }}
                                  >
                                    <span>🗑</span>
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredFlights.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">⌕</div>
                      <h3>No flights found</h3>
                      <p>
                        Try changing your search or status filter.
                      </p>
                    </div>
                  )}
                </div>

                <div className="table-footer">
                  <span>
                    Showing{" "}
                    <strong>{filteredFlights.length}</strong> of{" "}
                    <strong>{flights.length}</strong> requests
                  </span>

                  <div className="pagination">
                    <button disabled>←</button>
                    <button className="page-active">1</button>
                    <button disabled>→</button>
                  </div>
                </div>
              </section>

              <footer className="page-footer">
                <span>
                  © 2026 AVPLAT · Aviation Operations
                </span>
                <span>Dashboard Preview · Demo Data</span>
              </footer>
            </>
          )}
        </div>
      </main>
      {deleteFlight && (
        <div
          className="confirm-modal-backdrop"
          onClick={() => setDeleteFlight(null)}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon">!</div>

            <h2>Are you sure?</h2>

            <p>
              Are you sure you want to delete flight request{" "}
              <strong>{deleteFlight.id}</strong>?
            </p>

            <p className="confirm-modal-note">
              This action cannot be undone.
            </p>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-cancel-button"
                onClick={() => setDeleteFlight(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={() => setDeleteFlight(null)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

