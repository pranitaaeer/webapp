
import { useEffect, useMemo, useState } from "react";
import "../style/CrewPassengers.css";
import { api } from "../services/api";

type CrewMember = {
  id: string;
  name: string;
  role: string;
  license: string;
  phone: string;
  email: string;
  status: string;
  nationality: string;
};

type Passenger = {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passport: string;
  status: string;
};

type Props = {
  initialTab?: "crew" | "passengers";
};

type ApiRecord = Record<string, unknown>;

const getValue = (
  row: ApiRecord,
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

const getRows = (response: unknown): ApiRecord[] => {
  if (Array.isArray(response)) {
    return response as ApiRecord[];
  }

  if (response && typeof response === "object") {
    const result = response as Record<string, unknown>;

    if (Array.isArray(result.data)) {
      return result.data as ApiRecord[];
    }

    if (Array.isArray(result.crew)) {
      return result.crew as ApiRecord[];
    }

    if (Array.isArray(result.passengers)) {
      return result.passengers as ApiRecord[];
    }
  }

  return [];
};

const mapCrew = (row: ApiRecord): CrewMember => ({
  id: getValue(
    row,
    ["ClientCrewID", "ServiceRequestCrewID", "CrewID", "id"]
  ),
  name: getValue(
    row,
    ["CrewName", "Name", "FullName", "name"]
  ),
  role: getValue(
    row,
    ["Role", "CrewRole", "Designation", "Position"]
  ),
  license: getValue(
    row,
    ["License", "LicenseNumber", "LicenseNo"]
  ),
  phone: getValue(
    row,
    ["Phone", "PhoneNumber", "Mobile", "ContactNumber"]
  ),
  email: getValue(
    row,
    ["Email", "EmailAddress"]
  ),
  status: getValue(
    row,
    ["Status", "CrewStatus", "AvailabilityStatus"],
    "Unknown"
  ),
  nationality: getValue(
    row,
    ["Nationality", "Country"]
  ),
});

const mapPassenger = (row: ApiRecord): Passenger => ({
  id: getValue(
    row,
    [
      "ClientPassengerID",
      "CharterPassengerID",
      "ServiceRequestPassengerID",
      "PassengerID",
      "id",
    ]
  ),
  name: getValue(
    row,
    ["PassengerName", "Name", "FullName", "name"]
  ),
  email: getValue(
    row,
    ["Email", "EmailAddress"]
  ),
  phone: getValue(
    row,
    ["Phone", "PhoneNumber", "Mobile", "ContactNumber"]
  ),
  nationality: getValue(
    row,
    ["Nationality", "Country"]
  ),
  passport: getValue(
    row,
    ["Passport", "PassportNumber", "PassportNo"]
  ),
  status: getValue(
    row,
    ["Status", "PassengerStatus"],
    "Unknown"
  ),
});

export default function CrewPassengers({
  initialTab = "crew",
}: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const [crewData, setCrewData] = useState<CrewMember[]>([]);
  const [passengerData, setPassengerData] = useState<Passenger[]>([]);

  const [crewLoading, setCrewLoading] = useState(true);
  const [passengerLoading, setPassengerLoading] = useState(true);

  const [crewError, setCrewError] = useState("");
  const [passengerError, setPassengerError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedPerson, setSelectedPerson] = useState<
    CrewMember | Passenger | null
  >(null);

  const isCrew = activeTab === "crew";

  // Fetch crew and passenger records
  useEffect(() => {
    let cancelled = false;

    const fetchCrew = async () => {
      try {
        setCrewLoading(true);
        setCrewError("");

        const response = await api.getCrew();

        if (!cancelled) {
          setCrewData(getRows(response).map(mapCrew));
        }
      } catch (err) {
        console.error("Crew API error:", err);

        if (!cancelled) {
          setCrewError("Crew records load nahi ho paaye.");
        }
      } finally {
        if (!cancelled) {
          setCrewLoading(false);
        }
      }
    };

    const fetchPassengers = async () => {
      try {
        setPassengerLoading(true);
        setPassengerError("");

        const response = await api.getPassengers();

        if (!cancelled) {
          setPassengerData(getRows(response).map(mapPassenger));
        }
      } catch (err) {
        console.error("Passengers API error:", err);

        if (!cancelled) {
          setPassengerError("Passenger records load nahi ho paaye.");
        }
      } finally {
        if (!cancelled) {
          setPassengerLoading(false);
        }
      }
    };

    fetchCrew();
    fetchPassengers();

    return () => {
      cancelled = true;
    };
  }, []);

  // Crew search and filter
  const crewFiltered = useMemo(() => {
    return crewData.filter((person) => {
      const query = search.toLowerCase().trim();

      const matchesSearch = [
        person.name,
        person.id,
        person.role,
        person.license,
        person.email,
        person.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "All" || person.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [crewData, search, statusFilter]);

  // Passenger search and filter
  const passengerFiltered = useMemo(() => {
    return passengerData.filter((person) => {
      const query = search.toLowerCase().trim();

      const matchesSearch = [
        person.name,
        person.id,
        person.email,
        person.phone,
        person.passport,
        person.nationality,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "All" || person.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [passengerData, search, statusFilter]);

  const crewAvailable = crewData.filter(
    (person) => person.status.toLowerCase() === "available"
  ).length;

  const passengerConfirmed = passengerData.filter(
    (person) => person.status.toLowerCase() === "confirmed"
  ).length;

  const loading = isCrew ? crewLoading : passengerLoading;
  const error = isCrew ? crewError : passengerError;

  const retry = () => {
    window.location.reload();
  };

  return (
    <div className="cp-page">
      {/* Header */}
      <div className="cp-header">
        <div>
          <span className="cp-eyebrow">OPERATIONS / PEOPLE</span>
          <h1>Crew & Passengers</h1>
          <p>Manage crew members and passenger information.</p>
        </div>

        <div className="cp-header-badge">
          <span className="cp-live-dot" />
          People Management
        </div>
      </div>

      {/* Stats */}
      <div className="cp-stats">
        <div className="cp-stat-card">
          <div className="cp-stat-top">
            <span>Total Crew</span>
            <span className="cp-stat-icon">✈</span>
          </div>
          <h2>{crewData.length}</h2>
          <p>Registered crew records</p>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-top">
            <span>Available Crew</span>
            <span className="cp-stat-icon green">✓</span>
          </div>
          <h2>{crewAvailable}</h2>
          <p>Ready for assignment</p>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-top">
            <span>Total Passengers</span>
            <span className="cp-stat-icon purple">♙</span>
          </div>
          <h2>{passengerData.length}</h2>
          <p>Registered passenger records</p>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-top">
            <span>Confirmed Passengers</span>
            <span className="cp-stat-icon orange">✓</span>
          </div>
          <h2>{passengerConfirmed}</h2>
          <p>Confirmed passenger records</p>
        </div>
      </div>

      {/* Main panel */}
      <div className="cp-panel">
        <div className="cp-panel-header">
          <div>
            <h2>People Directory</h2>
            <p>View crew and passenger records.</p>
          </div>

          <span className="cp-record-count">
            {isCrew ? crewFiltered.length : passengerFiltered.length} Records
          </span>
        </div>

        {/* Tabs */}
        <div className="cp-tabs">
          <button
            className={isCrew ? "cp-tab active" : "cp-tab"}
            onClick={() => {
              setActiveTab("crew");
              setSearch("");
              setStatusFilter("All");
              setSelectedPerson(null);
            }}
          >
            <span>✈</span> Crew Members
            <span className="cp-tab-count">{crewData.length}</span>
          </button>

          <button
            className={!isCrew ? "cp-tab active" : "cp-tab"}
            onClick={() => {
              setActiveTab("passengers");
              setSearch("");
              setStatusFilter("All");
              setSelectedPerson(null);
            }}
          >
            <span>♙</span> Passengers
            <span className="cp-tab-count">{passengerData.length}</span>
          </button>
        </div>

        {/* Search and filter */}
        <div className="cp-toolbar">
          <div className="cp-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder={
                isCrew
                  ? "Search by name, ID, role or license..."
                  : "Search by name, ID, email or passport..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cp-filter"
          >
            <option value="All">All Status</option>

            {isCrew ? (
              <>
                <option value="Available">Available</option>
                <option value="On Duty">On Duty</option>
                <option value="On Leave">On Leave</option>
              </>
            ) : (
              <>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
              </>
            )}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="cp-empty">
            Loading {isCrew ? "crew" : "passenger"} records...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="cp-empty">
            <p>{error}</p>
            <button className="cp-view-btn" onClick={retry}>
              Retry
            </button>
          </div>
        )}

        {/* Crew table */}
        {!loading && !error && isCrew && (
          <div className="cp-table-wrap">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>CREW MEMBER</th>
                  <th>ROLE</th>
                  <th>LICENSE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {crewFiltered.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="cp-person">
                        <div className="cp-avatar">
                          {person.name
                            .split(" ")
                            .filter((part) => part !== "—")
                            .map((part) => part[0])
                            .join("") || "?"}
                        </div>

                        <div>
                          <strong>{person.name}</strong>
                          <span>{person.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{person.role}</td>
                    <td className="cp-mono">{person.license}</td>

                    <td>
                      <span
                        className={`cp-status ${person.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        <span className="cp-status-dot" />
                        {person.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="cp-view-btn"
                        onClick={() => setSelectedPerson(person)}
                      >
                        View Details <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {crewFiltered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="cp-empty">
                      No crew members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Passenger table */}
        {!loading && !error && !isCrew && (
          <div className="cp-table-wrap">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>PASSENGER</th>
                  <th>EMAIL</th>
                  <th>NATIONALITY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {passengerFiltered.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="cp-person">
                        <div className="cp-avatar passenger-avatar">
                          {person.name
                            .split(" ")
                            .filter((part) => part !== "—")
                            .map((part) => part[0])
                            .join("") || "?"}
                        </div>

                        <div>
                          <strong>{person.name}</strong>
                          <span>{person.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{person.email}</td>
                    <td>{person.nationality}</td>

                    <td>
                      <span
                        className={`cp-status ${person.status.toLowerCase()}`}
                      >
                        <span className="cp-status-dot" />
                        {person.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="cp-view-btn"
                        onClick={() => setSelectedPerson(person)}
                      >
                        View Details <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {passengerFiltered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="cp-empty">
                      No passengers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && (
          <div className="cp-table-footer">
            <span>
              Showing{" "}
              {isCrew ? crewFiltered.length : passengerFiltered.length} of{" "}
              {isCrew ? crewData.length : passengerData.length} records
            </span>
            <span className="cp-demo-label">Live API Data</span>
          </div>
        )}
      </div>

      {/* Details modal */}
      {selectedPerson && (
        <div
          className="cp-modal-overlay"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="cp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cp-modal-header">
              <div>
                <span className="cp-eyebrow">RECORD DETAILS</span>
                <h2>{selectedPerson.name}</h2>
              </div>

              <button
                className="cp-close-btn"
                onClick={() => setSelectedPerson(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="cp-modal-body">
              <div className="cp-detail-row">
                <span>Record ID</span>
                <strong>{selectedPerson.id}</strong>
              </div>

              <div className="cp-detail-row">
                <span>Name</span>
                <strong>{selectedPerson.name}</strong>
              </div>

              <div className="cp-detail-row">
                <span>Email</span>
                <strong>{selectedPerson.email}</strong>
              </div>

              <div className="cp-detail-row">
                <span>Phone</span>
                <strong>{selectedPerson.phone}</strong>
              </div>

              <div className="cp-detail-row">
                <span>Nationality</span>
                <strong>{selectedPerson.nationality}</strong>
              </div>

              {"role" in selectedPerson ? (
                <>
                  <div className="cp-detail-row">
                    <span>Role</span>
                    <strong>{selectedPerson.role}</strong>
                  </div>

                  <div className="cp-detail-row">
                    <span>License</span>
                    <strong>{selectedPerson.license}</strong>
                  </div>
                </>
              ) : (
                <div className="cp-detail-row">
                  <span>Passport</span>
                  <strong>{selectedPerson.passport}</strong>
                </div>
              )}

              <div className="cp-detail-row">
                <span>Status</span>
                <strong>{selectedPerson.status}</strong>
              </div>
            </div>

            <button
              className="cp-modal-done"
              onClick={() => setSelectedPerson(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}