const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getDashboard: () => apiRequest("/dashboard/summary"),
  getFlightRequests: () => apiRequest("/flight-requests"),
  getAircraft: () => apiRequest("/aircraft"),
  getCrew: () => apiRequest("/crew"),
  getPassengers: () => apiRequest("/passengers"),
};