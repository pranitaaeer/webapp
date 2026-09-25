
# Flight Request Reports Dashboard

A React-based dashboard for viewing and analyzing flight request data through reports, statistics, and visual charts.

## Features

- Display flight request statistics.
- View flight requests by status.
- Analyze flight request trends using charts.
- Filter reports based on date ranges.
- View monthly flight request data.
- Track flight request statuses such as Closed, Trip Cancelled, and Quote Cancelled.
- Fetch and display flight request data from an API.
- Responsive dashboard interface.

## Tech Stack

- React.js
- TypeScript
- CSS
- REST API
- Chart visualization

## API Integration

The dashboard fetches flight request data from the `/flight-requests` endpoint.

### Sample API Response

```json
{
  "success": true,
  "count": 100,
  "data": []
}
```

The `data` array contains flight request records used to generate reports and statistics.

## Date Filtering

The dashboard uses the `DateCreated` field to group flight requests by month and filter records according to the selected date range.

Monthly charts depend on the dates available in the API response.

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Navigate to the project directory

```bash
cd <project-folder>
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal to view the dashboard.

## Project Structure

```text
src/
├── components/
│   └── Reports.tsx
├── styles/
│   └── Reports.css
└── App.tsx
```

*The folder structure may vary depending on the project setup.*

## Future Improvements

- Add advanced date filters.
- Export reports to CSV or PDF.
- Add more detailed flight request analytics.
- Improve chart customization.
- Add pagination and additional filtering options.

## License

This project is intended for learning and development purposes.