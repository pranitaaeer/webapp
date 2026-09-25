import { useEffect, useMemo, useState } from "react";
import FlightRequests from "./FlightRequests";
import "../App.css";
import Aircraft from "./Aircraft";
import CrewPassengers from "./CrewPassengers";
import Reports from "./Reports";
import { api } from "../services/api";

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

const flights: Flight[] = [
  {
    id: "SR-2048",
    route: "BOM → DXB",
    from: "Mumbai",
    to: "Dubai",
    aircraft: "Gulfstream G650",
    date: "25 Sep 2026",
    status: "Active",
    passengers: 8,
  },
  {
    id: "SR-2047",
    route: "DEL → LHR",
    from: "New Delhi",
    to: "London",
    aircraft: "Bombardier Global 7500",
    date: "25 Sep 2026",
    status: "Confirmed",
    passengers: 10,
  },
  {
    id: "SR-2046",
    route: "BLR → SIN",
    from: "Bengaluru",
    to: "Singapore",
    aircraft: "Embraer Praetor 600",
    date: "26 Sep 2026",
    status: "Processing",
    passengers: 6,
  },
  {
    id: "SR-2045",
    route: "GOI → BOM",
    from: "Goa",
    to: "Mumbai",
    aircraft: "Cessna Citation X",
    date: "26 Sep 2026",
    status: "Confirmed",
    passengers: 5,
  },
  {
    id: "SR-2044",
    route: "DXB → CDG",
    from: "Dubai",
    to: "Paris",
    aircraft: "Dassault Falcon 8X",
    date: "27 Sep 2026",
    status: "Processing",
    passengers: 9,
  },
  {
    id: "SR-2043",
    route: "HYD → DEL",
    from: "Hyderabad",
    to: "New Delhi",
    aircraft: "Gulfstream G550",
    date: "27 Sep 2026",
    status: "Closed",
    passengers: 4,
  },
  {
    id: "SR-2042",
    route: "BOM → SIN",
    from: "Mumbai",
    to: "Singapore",
    aircraft: "Bombardier Challenger 650",
    date: "28 Sep 2026",
    status: "Declined",
    passengers: 7,
  },
];

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

function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeNav, setActiveNav] = useState("Dashboard");

  // Backend dashboard data
  const [summary, setSummary] =
    useState<DashboardSummary>(emptySummary);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Fetch dashboard summary from backend
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setApiError("");

        const response = (await api.getDashboard()) as {
          success: boolean;
          data: DashboardSummary;
        };

        if (!response.success) {
          throw new Error("Failed to load dashboard data");
        }

        setSummary(response.data);
      } catch (error) {
        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
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
  }, [search, statusFilter]);

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
              className={`nav-item ${
                activeNav === item.name ? "selected" : ""
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
            <span className="profile-menu">⋯</span>
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
                  <span>＋</span> New Flight Request
                </button>
              </section>

              {/* API Loading and Error */}
              {loading && (
                <p className="api-message">
                  Loading dashboard data...
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
                              className={`status-badge ${
                                statusClass[flight.status]
                              }`}
                            >
                              <span className="badge-dot" />
                              {flight.status}
                            </span>
                          </td>

                          <td>
                            <button
                              className="row-menu"
                              aria-label={`Actions for ${flight.id}`}
                              onClick={() =>
                                alert(`Selected ${flight.id}`)
                              }
                            >
                              ⋯
                            </button>
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
    </div>
  );
}

export default Dashboard;