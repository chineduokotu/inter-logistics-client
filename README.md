# CARGOA client

This folder is the complete React frontend. It can be hosted without the server source.

## Run locally

Open a terminal in this folder. On Windows PowerShell, use npm.cmd instead of npm if scripts are blocked:

1. npm install
2. Copy .env.example to .env if .env does not exist.
3. Set VITE_API_URL=http://127.0.0.1:4000/api
4. npm run dev

Open http://127.0.0.1:5173. The homepage works without the backend. Booking, tracking and sign-in need the backend and MongoDB.

## Host the frontend

Choose client as the hosting root folder.

- Install: npm ci
- Build: npm run build
- Publish directory: dist
- Production builds automatically use https://inter-logistics-server.onrender.com/api. VITE_API_URL overrides the local backend in development only.

Configure the static host to rewrite all page routes to /index.html so refreshing /book, /track, /admin and /mailbox works. Restart the development server after changing VITE_API_URL. Never put private keys here: all VITE_ values are public.

## Files

- src/: pages, components, styles and API connection
- src/contracts.ts: frontend validation schemas
- public/: images and original CC0 schematic map (license beside asset)
- tests/: frontend regression tests
- package.json: frontend commands and dependencies

The server has an independent copy of contracts.ts because each app must build alone. Keep validation changes consistent in both copies. Run npm test to check the frontend.

## Mapbox

Tracking and the admin map editor load Mapbox GL JS on demand. The API supplies a public pk. token from server/.env. Mapbox maps need WebGL and internet access. Markers require real admin-saved longitude/latitude; old schematic points are not reinterpreted. The tracking screen polls saved updates every 30 seconds; it does not receive GPS movement. If map loading fails, the shipment details and textual location summary remain available.

## Shipment statuses

New bookings start as Processing. Admins can save Processing, Dispatched, In Transit, Out for Delivery, Delivered or Cancelled, plus the legacy operational statuses. Each update records an administrator and timestamp, preserves history and sends the existing mailbox notification in the same transaction. Tracking shows the current persisted status, latest status timestamp and recorded milestones. Refresh Status fetches current data in place; automatic refresh remains every 30 seconds. Run the server migration command after updating to apply migration 003.
