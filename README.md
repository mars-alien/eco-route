# 🌿 EcoRoute — Intelligent Delivery Route Optimizer

> A full-stack delivery management system that clusters orders geographically and computes optimal driver routes using **K-Means++** and **Nearest Neighbor TSP**, implemented from scratch in pure Python.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [ML Algorithms](#ml-algorithms)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Design Decisions](#design-decisions)

---

## Overview

EcoRoute solves a real-world **last-mile delivery problem**: given a set of pending orders scattered across a city and a fleet of available drivers, how do you assign orders to drivers and sequence each driver's stops to minimize total travel distance?

The system uses a two-stage optimization:

1. **K-Means++ Clustering** — groups geographically close orders into clusters, one per driver
2. **Nearest Neighbor TSP Heuristic** — finds an efficient visit sequence within each cluster

Both algorithms are implemented from scratch in pure Python with no ML library dependencies, making every line explainable in a technical interview.

---

## Features

### Admin
- Create and manage delivery orders with live map coordinate preview
- View all orders with filter tabs (Pending / Assigned / In Transit / Delivered)
- Run one-click route optimization across all pending orders and available drivers
- Visualize cluster assignments and driver routes on an interactive dark-theme Leaflet map
- See per-driver route plans with distance, ETA, and ordered stop list

### Driver
- View assigned delivery route with sequenced stops and cumulative ETAs
- Interactive map with polyline route and numbered markers
- Mark individual stops as delivered from both list and map views
- Route auto-completes when all stops are marked done

### System
- JWT authentication with role-based access control (admin / driver)
- GeoJSON 2dsphere indexes for efficient geospatial queries
- Async FastAPI with Motor for non-blocking MongoDB operations
- React Query for server state — no manual `useEffect` data fetching
- Zustand for minimal global auth state with localStorage persistence

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Python 3.11 + FastAPI | Async, fast, automatic OpenAPI docs |
| Database | MongoDB 7 + GeoJSON | Native geospatial queries, flexible document schema |
| Async Driver | Motor 3 | Non-blocking MongoDB for asyncio — matches FastAPI's event loop |
| Auth | JWT (python-jose) + bcrypt | Stateless authentication, industry standard |
| ML / Optimization | Pure Python | Every line is explainable; no black-box library calls |
| Frontend | React 18 + Vite | Fast HMR, modern JSX tooling |
| Map | Leaflet.js + React-Leaflet | Open-source, no API key required |
| Server State | TanStack React Query v5 | Automatic caching, background refetch, loading states |
| Global State | Zustand | Minimal boilerplate for auth token/role |
| HTTP Client | Axios | Interceptors for JWT injection and 401 handling |
| Forms | React Hook Form | Uncontrolled inputs, performant validation |
| Container | Docker Compose | One-command MongoDB setup |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  React Query · Zustand · React Hook Form · Leaflet.js   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + JWT
┌──────────────────────▼──────────────────────────────────┐
│               FastAPI (Modular Monolith)                 │
│                                                          │
│  /api/auth  /api/orders  /api/drivers                    │
│  /api/routing            /api/assignments                │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Optimization Engine (Pure Python)       │    │
│  │  geo.py → kmeans.py → tsp.py → eta.py           │    │
│  │  Zero FastAPI/Motor imports — computation only   │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │ Motor (async)
┌──────────────────────▼──────────────────────────────────┐
│                 MongoDB 7 (Docker)                       │
│  orders · drivers · users · route_plans                  │
│  2dsphere indexes on orders.location, drivers.location   │
└─────────────────────────────────────────────────────────┘
```

**Modular Monolith** — FastAPI `APIRouter` gives clean module separation (auth, orders, drivers, routing, assignments) without the overhead of microservices. At this scale — a handful of drivers, hundreds of orders — separate deployable services add network hops and distributed transaction complexity with no benefit.

---

## ML Algorithms

### K-Means++ (`routing/algorithms/kmeans.py`)

Standard K-Means with smarter initialization:

**Why K-Means++?** Naive K-Means picks initial centroids randomly, which can lead to slow convergence or poor clusters. K-Means++ picks each subsequent centroid with probability proportional to `D(x)²` — the squared distance from the nearest already-chosen centroid. This spreads centroids out and reliably produces better clusters.

```
1. Pick first centroid uniformly at random from orders
2. For each remaining centroid:
   - Compute D(x)² for every point to its nearest chosen centroid
   - Sample next centroid with probability ∝ D(x)²
3. Iterate:
   - Assign each order to nearest centroid (Haversine distance)
   - Recompute centroids as mean lat/lng of assigned points
   - Stop when max centroid shift < 0.0001 km or max_iter reached
```

**Distance metric:** Haversine formula (great-circle distance on a sphere), not Euclidean. One degree of longitude covers ~111 km at the equator but shrinks near the poles — Euclidean distance on raw coordinates is geometrically wrong for geographic data.

### Nearest Neighbor TSP (`routing/algorithms/tsp.py`)

Classic greedy heuristic for the Travelling Salesman Problem:

```
1. Start at driver's current GPS location (the depot)
2. Find the nearest unvisited stop (Haversine)
3. Move there, add to route, mark visited
4. Repeat until all stops visited
```

- **Complexity:** O(n²) per cluster — negligible for ≤20 stops per driver
- **Quality:** ~20% above optimal on random instances (acceptable for MVP)
- **Production path:** Google OR-Tools CVRPTW with time windows and vehicle capacity constraints

### ETA Predictor (`routing/algorithms/eta.py`)

Linear model fitted to typical city delivery conditions:

```
ETA (minutes) = 5.0 + 2.0 × distance_km + 3.0 × num_stops
```

| Coefficient | Value | Meaning |
|---|---|---|
| b0 (base) | 5.0 min | App startup, first movement overhead |
| b1 (speed) | 2.0 min/km | 30 km/h average city speed |
| b2 (stop) | 3.0 min/stop | Unloading + customer confirmation |

**Production path:** Train on historical delivery logs with features `time_of_day`, `day_of_week`, `vehicle_type` using `sklearn.LinearRegression`.

---

## Project Structure

```
ecoroute/
├── docker-compose.yml
│
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── config.py                # Pydantic settings (reads .env)
│   ├── database.py              # Motor client, 2dsphere index creation
│   ├── seed.py                  # Creates admin, 3 drivers, 15 Bengaluru orders
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── auth/                    # JWT login, register, /me
│   ├── orders/                  # CRUD + status state machine
│   ├── drivers/                 # List, available filter, location update
│   │
│   ├── routing/
│   │   ├── router.py            # POST /optimize, GET /plans
│   │   ├── service.py           # Orchestration pipeline
│   │   ├── schemas.py
│   │   └── algorithms/          # Pure Python — zero app imports
│   │       ├── geo.py           # Haversine formula
│   │       ├── kmeans.py        # K-Means++ from scratch
│   │       ├── tsp.py           # Nearest Neighbor heuristic
│   │       └── eta.py           # Linear ETA model
│   │
│   └── assignments/             # Driver route fetch, stop completion
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx             # QueryClient, BrowserRouter, root render
        ├── App.jsx              # Route definitions
        ├── api/                 # axios.js + one file per module
        ├── hooks/               # React Query hooks (useOrders, useRoutes…)
        ├── store/               # Zustand authStore (persisted)
        ├── components/
        │   ├── layout/          # Sidebar, Topbar, ProtectedRoute
        │   ├── map/             # DeliveryMap (display-only), ClusterMarkers, RoutePolyline
        │   ├── orders/          # OrderTable, OrderCard, StatusBadge
        │   └── ui/              # Button, Input, Select, Spinner, EmptyState
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── admin/           # Dashboard, Orders, CreateOrder, RouteOptimizer
        │   └── driver/          # Dashboard, RoutePage
        └── styles/
            ├── globals.css      # Design tokens (CSS variables), global resets
            └── map.css          # Leaflet dark theme overrides
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for MongoDB)
- Python 3.11+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ecoroute.git
cd ecoroute
```

### 2. Start MongoDB

```bash
docker compose up -d
```

### 3. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

> **Note — Python 3.14 users:** `passlib[bcrypt]` is incompatible with bcrypt 5.0+. This project uses `bcrypt` directly instead of passlib — no action needed, it's already handled in the code.

Copy the environment file (defaults work out of the box):

```bash
# .env is already present with development defaults
# Edit JWT_SECRET before any production deployment
```

Seed the database with demo data:

```bash
python seed.py
```

Start the API server:

```bash
python -m uvicorn main:app --reload --port 8000
```

### 4. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 5. Open the app

| URL | Description |
|---|---|
| http://localhost:5173 | React frontend |
| http://localhost:8000/docs | FastAPI Swagger UI |
| http://localhost:8000/redoc | FastAPI ReDoc |

### Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@ecoroute.com | admin123 |
| Driver 1 | driver1@ecoroute.com | driver123 |
| Driver 2 | driver2@ecoroute.com | driver123 |
| Driver 3 | driver3@ecoroute.com | driver123 |

### Quick demo flow

1. Log in as **admin** → Dashboard shows 15 pending orders, 3 available drivers
2. Go to **Optimizer** → Click **Run Optimization**
3. Watch the map: orders cluster by geography, dashed polylines show each driver's route
4. Log in as **driver1** → See assigned stops with ETAs
5. Click **Mark as Delivered** on each stop → status updates propagate in real time

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None | `{ email, password }` → `{ token, role, user_id, name }` |
| POST | `/api/auth/register` | None | Create admin or driver account |
| GET | `/api/auth/me` | Any | Returns current user from token |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | Any | Admin: all orders. Driver: their assigned orders |
| POST | `/api/orders` | Admin | Create order with lat/lng coordinates |
| GET | `/api/orders/{id}` | Any | Single order |
| PATCH | `/api/orders/{id}/status` | Driver | Advance status (`IN_TRANSIT`, `DELIVERED`) |
| DELETE | `/api/orders/{id}` | Admin | Delete — PENDING orders only |

### Drivers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/drivers` | Admin | All drivers |
| GET | `/api/drivers/available` | Admin | Drivers with `is_available: true` |
| PATCH | `/api/drivers/{id}/location` | Driver | Update GPS position |

### Routing

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/routing/optimize` | Admin | Run K-Means++ + TSP optimization |
| GET | `/api/routing/plans` | Admin | All route plans |
| GET | `/api/routing/plans/{id}` | Any | Single route plan with stops |

### Assignments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/assignments/driver/{id}` | Any | Active route plan for a driver |
| PATCH | `/api/assignments/{plan_id}/stops/{index}/complete` | Driver | Mark stop delivered |
| GET | `/api/assignments/all` | Admin | All active plans summary |

---

## Screenshots

### Login
Clean dark-theme login with role hints for demo use.

### Admin Dashboard
4 stat cards (total orders, pending, available drivers, route plans) + recent activity tables.

### Orders Page
Filterable table with status badges (Pending / Assigned / In Transit / Delivered) and inline delete for pending orders.

### Route Optimizer
Split-panel view: left panel shows order/driver counts and route plan cards; right panel is a full-height Leaflet map with color-coded cluster markers and dashed driver route polylines.

### Driver Route Page
Full-screen map with sequenced numbered markers and a bottom sheet showing the current stop with a "Mark as Delivered" button.

---

## Design Decisions

### Why a Modular Monolith, not Microservices?

FastAPI `APIRouter` provides clean module boundaries (auth, orders, drivers, routing, assignments) without separate deployable services. At this scale — a handful of drivers, hundreds of orders — microservices add network hops, distributed transaction complexity, and deployment overhead with zero benefit. The package structure makes future service extraction straightforward if scale demands it.

### Why MongoDB over PostgreSQL + PostGIS?

MongoDB has **native GeoJSON support** with `2dsphere` indexes. A proximity query is a single `$nearSphere` without PostGIS extension management. Route plan documents naturally embed their stops array — no join required to fetch a driver's full route. Schema flexibility means evolving the order document without migration files.

### Why implement algorithms from scratch?

- `sklearn.KMeans` + `OR-Tools` would solve the problem, but you can't explain what they do in an interview
- The K-Means++ implementation is ~60 lines; the TSP heuristic is ~25 lines
- Every coefficient, every distance formula, every convergence condition is visible and explainable
- The `routing/algorithms/` folder has **zero imports from FastAPI or Motor** — pure computation, fully unit-testable in isolation

### Why `Motor` over `PyMongo`?

FastAPI is built on asyncio. Motor is the official async MongoDB driver — same API as PyMongo but never blocks the event loop. This matters for `POST /routing/optimize` which performs multiple DB reads before returning.

### Why React Query over `useEffect` + `useState`?

React Query handles loading states, error states, background refetching, cache invalidation, and deduplication automatically. Using `useEffect` for data fetching means manually reimplementing all of that, plus risk of race conditions and stale closure bugs.

---

## Environment Variables

```env
# backend/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ecoroute
JWT_SECRET=change-this-in-production    # Use a long random string in prod
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440                 # 24 hours
```

---

## Production Considerations

| Area | Current (MVP) | Production Path |
|---|---|---|
| Auth storage | localStorage (XSS risk) | httpOnly cookies |
| JWT secret | Static env var | Secrets manager (AWS SSM, Vault) |
| Password hashing | bcrypt (good) | Keep bcrypt, increase rounds |
| ETA model | Linear formula | Train on historical logs with sklearn |
| TSP solver | Nearest neighbor | Google OR-Tools CVRPTW |
| MongoDB | Single node | Replica set with oplog |
| Frontend | Vite dev server | Static build behind CDN |
| API | Uvicorn single process | Gunicorn + multiple Uvicorn workers |

---

## License

MIT — see [LICENSE](LICENSE) for details.
