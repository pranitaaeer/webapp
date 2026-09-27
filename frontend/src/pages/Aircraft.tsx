
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "../style/Aircraft.css";
import { api } from "../services/api";
import Loader from "../components/Loader";

type AircraftItem = {
  id: number;
  registration: string;
  name: string;
  type: string;
  manufacturer: string;
  capacity: number;
  range: string;
  location: string;
};

type ApiAircraft = Record<string, unknown>;

type AircraftDetail = {
  AircraftID?: number;
  Registration?: string;
  AircraftManfacturer?: string;
  AircraftType?: string;
  AircaftCategory?: string;
  OperationType?: string;
  EngineType?: string;
  FuelType?: string;
  NoOfPaxCapacity?: number;
  NoOfCrewCapacity?: number;
  MaxPaxSeats?: number;
  SEDistance?: string;
  MFCapacity?: string;
  BaseLocation?: string;
  ACICAOcode?: string;
  OPSRegulation?: string;
  MTOWeight?: number;
  UnitType?: string;
  CruiseSpeed?: number;
  Carbonoffset?: string;
  EtopsEnable?: string;
};

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

const mapAircraft = (row: ApiAircraft): AircraftItem => {
  return {
    id: getNumber(row, ["AircraftID"]),
    registration: getValue(row, ["Registration"], "—"),
    name: getValue(
      row,
      ["AircraftType", "AircraftName", "ModelName", "Name"],
      "—"
    ),
    type: getValue(row, ["AircaftCategory", "AircraftType"], "—"),
    manufacturer: getValue(
      row,
      ["Manufacturer", "AircraftManfacturer"],
      "—"
    ),
    capacity: getNumber(row, ["PassengerCapacity", "NoOfPaxCapacity"]),
    range: getValue(row, ["FlightRange", "SEDistance"], "—"),
    location: getValue(row, ["BaseLocation", "Location"], "—"),
  };
};

function Aircraft() {
  const [aircraftList, setAircraftList] = useState<AircraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedAircraft, setSelectedAircraft] =
    useState<AircraftItem | null>(null);

  const [details, setDetails] = useState<AircraftDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    registration: "",
    name: "",
    type: "",
    manufacturer: "",
    capacity: "",
    range: "",
    location: "",
  });

  /* ---------- fetch list ---------- */
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

  /* ---------- fetch detail ---------- */
  const openDetails = async (aircraft: AircraftItem) => {
    setSelectedAircraft(aircraft);
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const res = await api.getAircraftById(aircraft.id);

      const payload =
        (res as { data?: AircraftDetail }).data ??
        (res as AircraftDetail);

      setDetails(payload);
    } catch (err) {
      console.error("Aircraft detail API error:", err);
      setDetailsError("Details load nahi ho paayi.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedAircraft(null);
    setDetails(null);
    setDetailsError("");
  };

  /* ---------- search ---------- */
  const filteredAircraft = useMemo(() => {
    return aircraftList.filter((aircraft) => {
      const query = search.toLowerCase().trim();

      return [
        aircraft.registration,
        aircraft.name,
        aircraft.type,
        aircraft.manufacturer,
        aircraft.location,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [aircraftList, search]);

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
      location: form.location.trim(),
    };

    setAircraftList((prev) => [newAircraft, ...prev]);

    setForm({
      registration: "",
      name: "",
      type: "",
      manufacturer: "",
      capacity: "",
      range: "",
      location: "",
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
            <span>With Capacity</span>
            <span className="aircraft-stat-icon green">✓</span>
          </div>
          <strong>
            {
              aircraftList.filter((a) => a.capacity > 0).length
            }
          </strong>
          <small>Passenger info available</small>
        </div>

        <div className="aircraft-stat-card">
          <div className="aircraft-stat-top">
            <span>Manufacturers</span>
            <span className="aircraft-stat-icon orange">↗</span>
          </div>
          <strong>
            {
              new Set(
                aircraftList
                  .map((a) => a.manufacturer)
                  .filter((m) => m && m !== "—")
              ).size
            }
          </strong>
          <small>Unique manufacturers</small>
        </div>

        <div className="aircraft-stat-card">
          <div className="aircraft-stat-top">
            <span>Base Locations</span>
            <span className="aircraft-stat-icon red">⚙</span>
          </div>
          <strong>
            {
              new Set(
                aircraftList
                  .map((a) => a.location)
                  .filter((l) => l && l !== "—")
              ).size
            }
          </strong>
          <small>Different bases</small>
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
        </div>

        {loading && (
          <p className="aircraft-loading"><Loader /></p>
        )}

        {!loading && error && (
          <div className="aircraft-empty">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

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
                      <button
                        className="aircraft-view-btn"
                        onClick={() => openDetails(aircraft)}
                      >
                        View ↗
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAircraft.length === 0 && (
                  <tr>
                    <td colSpan={6} className="aircraft-empty">
                      No aircraft found.
                      <button onClick={() => setSearch("")}>
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
            Showing {filteredAircraft.length} of {aircraftList.length}{" "}
            aircraft
          </div>
        )}
      </div>

      {/* ---------------- Aircraft Details Modal ---------------- */}
      {selectedAircraft && (
        <div className="aircraft-modal-backdrop" onClick={closeDetails}>
          <div
            className="aircraft-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aircraft-modal-header">
              <div>
                <span className="aircraft-modal-eyebrow">
                  AIRCRAFT DETAILS
                </span>
                <h2>
                  {details?.AircraftType ?? selectedAircraft.name}
                </h2>
                <p>
                  {details?.Registration ??
                    selectedAircraft.registration}
                </p>
              </div>
              <button
                className="aircraft-close-btn"
                onClick={closeDetails}
              >
                ×
              </button>
            </div>

            <div className="aircraft-detail-list">
              {detailsLoading && <p>Loading details...</p>}

              {!detailsLoading && detailsError && (
                <p>{detailsError}</p>
              )}

              {!detailsLoading && !detailsError && (
                <>
                  <div>
                    <span>Manufacturer</span>
                    <strong>
                      {details?.AircraftManfacturer ??
                        selectedAircraft.manufacturer ??
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Aircraft type</span>
                    <strong>
                      {details?.AircraftType ??
                        selectedAircraft.type ??
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Passenger capacity</span>
                    <strong>
                      {details?.NoOfPaxCapacity ??
                        selectedAircraft.capacity ??
                        0}{" "}
                      seats
                    </strong>
                  </div>

                  <div>
                    <span>Flight range</span>
                    <strong>
                      {details?.SEDistance ??
                        selectedAircraft.range ??
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Base location</span>
                    <strong>
                      {details?.BaseLocation ??
                        selectedAircraft.location ??
                        "—"}
                    </strong>
                  </div>

                  {details?.ACICAOcode && (
                    <div>
                      <span>ICAO code</span>
                      <strong>{details.ACICAOcode}</strong>
                    </div>
                  )}

                  {details?.EngineType && (
                    <div>
                      <span>Engine type</span>
                      <strong>{details.EngineType}</strong>
                    </div>
                  )}

                  {details?.NoOfCrewCapacity !== undefined && (
                    <div>
                      <span>Crew capacity</span>
                      <strong>{details.NoOfCrewCapacity}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              className="aircraft-primary-btn aircraft-modal-done"
              onClick={closeDetails}
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
                      setForm({
                        ...form,
                        manufacturer: e.target.value,
                      })
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

                <label className="aircraft-full-field">
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
              </div>

              <div className="aircraft-form-actions">
                <button
                  type="button"
                  className="aircraft-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="aircraft-primary-btn">
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