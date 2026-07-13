# ParkingPal

Peer-to-peer parking marketplace — rent out your driveway or find affordable parking near your destination. Airbnb-style two-sided platform with mobile apps for renters and hosts.

## What it does

- **Renters:** Search on a map, filter spots, book time slots, pay via Stripe, message hosts, manage vehicles and bookings.
- **Hosts:** List spots (photos, pricing, availability), manage bookings, track earnings, configure payouts.
- **Platform:** Auth with email verification, ID verification, reviews, notifications, and an admin web dashboard.

## Tech stack

| Layer | Stack |
|-------|--------|
| Mobile | React Native (Expo 54), React Navigation, MapLibre, Stripe |
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| Admin | Vite, React |
| Shared | `@parkingpal/shared-types` monorepo package |

## Project structure

```
parkingPal/
├── mobile/              # Expo app (renter + host flows)
├── parkingpal-backend/  # Express API (auth, spots, bookings, payments, messaging)
├── admin-web/           # Admin dashboard
├── shared-types/        # Shared TypeScript types
└── docs/                # Architecture, setup, and backend guides
```

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Backend

```bash
cd parkingpal-backend
npm install
cp .env.example .env   # set DATABASE_URL, JWT secrets, Stripe keys
npm run prisma:generate
npm run prisma:migrate
npm run dev            # http://localhost:5000
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` to your backend URL (e.g. `http://localhost:5000`).

### Admin web

```bash
cd admin-web
npm install
npm run dev
```

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/ParkingPal_Documentation.md](docs/ParkingPal_Documentation.md) | Full product spec and user flows |
| [docs/APP_ARCHITECTURE.md](docs/APP_ARCHITECTURE.md) | System architecture |
| [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) | Stripe integration |
| [docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md) | Google / Apple sign-in |
| [docs/backend/](docs/backend/) | Payment safety, webhooks, caching, pagination |
| [parkingpal-backend/README.md](parkingpal-backend/README.md) | API endpoints reference |

## License

ISC
