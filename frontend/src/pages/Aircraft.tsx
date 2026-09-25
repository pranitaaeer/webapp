
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "../style/Aircraft.css";
import { api } from "../services/api";

type AircraftStatus = "Available" | "In Flight" | "Maintenance";

type AircraftItem = {
  id: number;
  registration: string;
  name: string;
  type: string;
  manufacturer: string;
  capacity: number;
  range: string;
  status: AircraftStatus;
  location: string;
  year: number;
};

type ApiAircraft = Record<string, unknown>;

const statusOptions = ["All Status", "Available", "In Flight", "Maintenance"];

const getValue = (
  row: ApiAircraft,
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

const getNumber = (row: ApiAircraft, keys: string[]): number => {
  const value = getValue(row, keys, "0");
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeStatus = (value: string): AircraftStatus => {
  const status = value.toLowerCase();

  if (status.includes("maint")) return "Maintenance";
  if (status.includes("flight") || status.includes("active")) return "In Flight";

  return "Available";
};

const mapAircraft = (row: ApiAircraft): AircraftItem => {
  return {
    id: getNumber(row, ["AircraftID", "AircraftId", "id"]),
    registration: getValue(
      row,
      ["RegistrationNumber", "Registration", "AircraftRegistration", "registration"],
      "—"
    ),
    name: getValue(
      row,
      ["AircraftName", "AircraftModel", "ModelName", "Name", "name"],
      "—"
    ),
    type: getValue(
      row,
      ["AircraftType", "TypeName", "Type", "type"],
      "—"
    ),
    manufacturer: getValue(
      row,
      ["Manufacturer", "ManufacturerName", "manufacturer"],
      "—"
    ),
    capacity: getNumber(
      row,
      ["PassengerCapacity", "Capacity", "SeatingCapacity", "capacity"]
    ),
    range: getValue(
      row,
      ["FlightRange", "Range", "AircraftRange", "range"],
      "—"
    ),
    status: normalizeStatus(
      getValue(row, ["Status", "AvailabilityStatus", "status"], "Available")
    ),
    location: getValue(
      row,
      ["BaseLocation", "Location", "AirportName", "location"],
      "—"
    ),
    year: getNumber(
      row,
      ["ManufacturingYear", "Year", "ModelYear", "year"]
    ),
  };
};

function Aircraft() {
  const [aircraftList, setAircraftList] = useState<AircraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [selectedAircraft, setSelectedAircraft] =
    useState<AircraftItem | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    registration: "",
    name: "",
    type: "",
    manufacturer: "",
    capacity: "",
    range: "",
    status: "Available" as AircraftStatus,
    location: "",
    year: "",
  });

  // Fetch aircraft from backend
  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.getAircraft();

        const result = response as
          | ApiAircraft[]
          | { data?: ApiAircraft[]; aircraft?: ApiAircraft[] };

        const rows = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.aircraft)
              ? result.aircraft
              : [];

        setAircraftList(rows.map(mapAircraft));
      } catch (err) {
        console.error("Aircraft API error:", err);
        setError("Aircraft data load nahi ho paaya. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAircraft();
  }, []);

  // Search and filter
  const filteredAircraft = useMemo(() => {
    return aircraftList.filter((aircraft) => {
      const query = search.toLowerCase().trim();

      const matchesSearch = [
        aircraft.registration,
        aircraft.name,
        aircraft.type,
        aircraft.manufacturer,
        aircraft.location,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All Status" ||
        aircraft.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [aircraftList, search, statusFilter]);

  const availableCount = aircraftList.filter(
    (a) => a.status === "Available"
  ).length;

  const inFlightCount = aircraftList.filter(
    (a) => a.status === "In Flight"
  ).length;

  const maintenanceCount = aircraftList.filter(
    (a) => a.status === "Maintenance"
  ).length;

  // Frontend-only add: no POST endpoint is configured yet
  const handleAddAircraft = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newAircraft: AircraftItem = {
      id: Date.now(),
      registration: form.registration.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type.trim(),
      manufacturer: form.manufacturer.trim(),
      capacity: Number(form.capacity),
      range: form.range.trim(),
      status: form.status,
      location: form.location.trim(),
      year: Number(form.year),
    };

    setAircraftList((prev) => [newAircraft, ...prev]);

    setForm({
      registration: "",
      name: "",
      type: "",
      manufacturer: "",
      capacity: "",
      range: "",
      status: "Available",
      location: "",
      year: "",
    });

    setShowForm(false);
  };

  return (
    <div className="aircraft-page">
      {/* Header */}
      <div className="aircraft-header">
        <div>
          <div className="aircraft-breadcrumb">
            Fleet Management <span>/</span> Aircraft
          </div>
          <h1>Aircraft Management</h1>
          <p>Manage your fleet, aircraft details and availability.</p>
        </div>

        <button
          className="aircraft-primary-btn"
          onClick={() => setShowForm(true)}
        >
          <span>＋</span> Add Aircraft
        </button>
      </div>

      {/* Stats */}
      <div className="aircraft-stats">
        <div className="aircraft-stat-card">
          <div className="aircraft-stat-top">
            <span>Total Aircraft</span>
            <span className="aircraft-stat-icon blue">✈</span>
          </div>
          <strong>{aircraftList.length}</strong>
          <small>Registered in fleet</small>
        </div>

        <div className="aircraft-stat-card">
          <div className="aircraft-stat-top">
            <span>Available</span>
            <span className="aircraft-stat-icon green">✓</span>
          </div>
          <strong>{availableCount}</strong>
          <small>Ready for operation</small>
        </div>

        <div className="aircraft-stat-card">
          <div className="aircraft-stat-top">
            <span>In Flight</span>
            <span className="aircraft-stat-icon orange">↗</span>
          </div>
          <strong>{inFlightCount}</strong>
          <small>Currently operating</small>
        </div>

        <div className="aircraft-stat-card">
          <div className="aircraft-stat-top">
            <span>Maintenance</span>
            <span className="aircraft-stat-icon red">⚙</span>
          </div>
          <strong>{maintenanceCount}</strong>
          <small>Under maintenance</small>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="aircraft-table-card">
        <div className="aircraft-table-heading">
          <div>
            <h2>Fleet Overview</h2>
            <p>View and manage all registered aircraft.</p>
          </div>
          <span className="aircraft-count">
            {filteredAircraft.length} aircraft
          </span>
        </div>

        {/* Search and Filter */}
        <div className="aircraft-toolbar">
          <div className="aircraft-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search registration, model, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter aircraft by status"
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
          <p className="aircraft-loading">
            Loading aircraft...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="aircraft-empty">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="aircraft-table-wrap">
            <table className="aircraft-table">
              <thead>
                <tr>
                  <th>AIRCRAFT</th>
                  <th>REGISTRATION</th>
                  <th>TYPE</th>
                  <th>CAPACITY</th>
                  <th>BASE LOCATION</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredAircraft.map((aircraft) => (
                  <tr key={aircraft.id}>
                    <td>
                      <div className="aircraft-name-cell">
                        <div className="aircraft-plane-icon">✈</div>
                        <div>
                          <strong>{aircraft.name}</strong>
                          <span>{aircraft.manufacturer}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="aircraft-registration">
                        {aircraft.registration}
                      </span>
                    </td>

                    <td>{aircraft.type}</td>
                    <td>{aircraft.capacity} seats</td>
                    <td>{aircraft.location}</td>

                    <td>
                      <span
                        className={`aircraft-status aircraft-status-${aircraft.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        <span className="aircraft-status-dot" />
                        {aircraft.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="aircraft-view-btn"
                        onClick={() => setSelectedAircraft(aircraft)}
                      >
                        View ↗
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAircraft.length === 0 && (
                  <tr>
                    <td colSpan={7} className="aircraft-empty">
                      No aircraft found.
                      <button
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All Status");
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

        {!loading && !error && (
          <div className="aircraft-table-footer">
            Showing {filteredAircraft.length} of {aircraftList.length} aircraft
          </div>
        )}
      </div>

      {/* Aircraft Details Modal */}
      {selectedAircraft && (
        <div
          className="aircraft-modal-backdrop"
          onClick={() => setSelectedAircraft(null)}
        >
          <div
            className="aircraft-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aircraft-modal-header">
              <div>
                <span className="aircraft-modal-eyebrow">
                  AIRCRAFT DETAILS
                </span>
                <h2>{selectedAircraft.name}</h2>
                <p>{selectedAircraft.registration}</p>
              </div>
              <button
                className="aircraft-close-btn"
                onClick={() => setSelectedAircraft(null)}
              >
                ×
              </button>
            </div>

            <div className="aircraft-detail-list">
              <div>
                <span>Manufacturer</span>
                <strong>{selectedAircraft.manufacturer}</strong>
              </div>
              <div>
                <span>Aircraft type</span>
                <strong>{selectedAircraft.type}</strong>
              </div>
              <div>
                <span>Passenger capacity</span>
                <strong>{selectedAircraft.capacity} seats</strong>
              </div>
              <div>
                <span>Flight range</span>
                <strong>{selectedAircraft.range}</strong>
              </div>
              <div>
                <span>Base location</span>
                <strong>{selectedAircraft.location}</strong>
              </div>
              <div>
                <span>Manufacturing year</span>
                <strong>{selectedAircraft.year || "—"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selectedAircraft.status}</strong>
              </div>
            </div>

            <button
              className="aircraft-primary-btn aircraft-modal-done"
              onClick={() => setSelectedAircraft(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Add Aircraft Modal */}
      {showForm && (
        <div
          className="aircraft-modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <div
            className="aircraft-modal aircraft-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aircraft-modal-header">
              <div>
                <span className="aircraft-modal-eyebrow">
                  FLEET MANAGEMENT
                </span>
                <h2>Add New Aircraft</h2>
                <p>Enter the aircraft information below.</p>
              </div>
              <button
                className="aircraft-close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAircraft}>
              <div className="aircraft-form-grid">
                <label>
                  Registration Number *
                  <input
                    required
                    value={form.registration}
                    onChange={(e) =>
                      setForm({ ...form, registration: e.target.value })
                    }
                    placeholder="e.g. VT-AVP"
                  />
                </label>

                <label>
                  Aircraft Model *
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Challenger 350"
                  />
                </label>

                <label>
                  Manufacturer *
                  <input
                    required
                    value={form.manufacturer}
                    onChange={(e) =>
                      setForm({ ...form, manufacturer: e.target.value })
                    }
                    placeholder="e.g. Bombardier"
                  />
                </label>

                <label>
                  Aircraft Type *
                  <input
                    required
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    placeholder="e.g. Super Midsize Jet"
                  />
                </label>

                <label>
                  Passenger Capacity *
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    placeholder="e.g. 9"
                  />
                </label>

                <label>
                  Flight Range *
                  <input
                    required
                    value={form.range}
                    onChange={(e) =>
                      setForm({ ...form, range: e.target.value })
                    }
                    placeholder="e.g. 5,926 km"
                  />
                </label>

                <label>
                  Base Location *
                  <input
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="e.g. Mumbai (BOM)"
                  />
                </label>

                <label>
                  Manufacturing Year *
                  <input
                    required
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: e.target.value })
                    }
                    placeholder="e.g. 2024"
                  />
                </label>

                <label className="aircraft-full-field">
                  Availability Status
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as AircraftStatus,
                      })
                    }
                  >
                    <option value="Available">Available</option>
                    <option value="In Flight">In Flight</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>
              </div>

              <div className="aircraft-form-actions">
                <button
                  type="button"
                  className="aircraft-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aircraft-primary-btn"
                >
                  Save Aircraft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Aircraft;