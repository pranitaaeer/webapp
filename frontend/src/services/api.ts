const API_BASE_URL = "https://webapp-aqgx.onrender.com/api";

// const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getDashboard: () => apiRequest("/dashboard/summary"),
  getRecentFlights: () => apiRequest("/dashboard/recent-flights"),
  getFlightRequests: () => apiRequest("/flight-requests"),
  getFlightRequestById: (id: string) => apiRequest(`/flight-requests/${id}`),
  getAircraft: () => apiRequest("/aircraft"),
  getAircraftById: (id: string | number) => apiRequest(`/aircraft/${id}`),
  getCrew: () => apiRequest("/crew"),
  getCrewById: (id: string | number) => apiRequest(`/crew/${id}`),
  getPassengers: () => apiRequest("/passengers"),
  getPassengerById: (id: string | number) => apiRequest(`/passengers/${id}`),
};