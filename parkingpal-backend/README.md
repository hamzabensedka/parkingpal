# ParkingPal Backend - Authentication API

A production-ready authentication system for ParkingPal using Node.js, TypeScript, Express.js, PostgreSQL, and JWT.

## Features

- User registration with email verification
- Login with JWT (access + refresh tokens)
- Password reset via email
- Email verification
- Profile management
- ID document upload for verification
- Rate limiting on authentication endpoints
- Security headers with Helmet
- CORS configuration
- Input validation with Zod

## Tech Stack

- **Runtime:** Node.js v18+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **Email:** Nodemailer
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js v18 or higher
- PostgreSQL 15+ (local or hosted)
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
cd parkingpal-backend
npm install
```

### 2. Configure Environment

Copy the example environment file and update values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/parkingpal"
JWT_SECRET="your-32-character-secret-here-min"
JWT_REFRESH_SECRET="another-32-character-secret-here"

# Optional (for email)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### 3. Set Up Database

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout (requires auth) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user (requires auth) |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile (requires auth) |
| PUT | `/api/users/profile` | Update profile (requires auth) |
| POST | `/api/users/verify-id` | Upload ID document (requires auth) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

## Request/Response Examples

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678",
  "userType": "renter"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Account created successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "phone": "+33612345678",
      "userType": "renter",
      "verified": {
        "email": false,
        "phone": false,
        "id": false
      },
      "rating": 0,
      "reviewCount": 0,
      "isSuperhost": false,
      "memberSince": "2025-02-07T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Authenticated Request

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGc...
```

## Rate Limits

- Login/Register: 5 requests per 15 minutes
- Password Reset: 3 requests per hour
- Email Verification: 10 requests per hour
- Token Refresh: 20 requests per hour
- General API: 100 requests per 15 minutes

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## Project Structure

```
parkingpal-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── modules/
│   │   └── auth/        # Authentication module
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # Uploaded files
└── .env                 # Environment variables
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT with separate secrets for access and refresh tokens
- Rate limiting on authentication endpoints
- Helmet security headers
- CORS with configurable origins
- Input validation on all endpoints
- Token expiration and refresh mechanism

## License

ISC
