# Women's Safety Platform

A full-stack web application for women's safety featuring anonymous reporting, SOS alerts, location flagging, and an NGO admin dashboard.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt

## Features

- JWT-based authentication with role support (User / NGO Admin)
- Anonymous abuse reporting with encryption
- One-click SOS emergency alerts with live location
- Automatic location flagging for repeat-incident areas
- NGO Dashboard with report management, map view, and SOS alerts
- Multilingual UI (English + Hindi)
- Interactive map with flagged zones and nearby police stations

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on `mongodb://localhost:27017` (or update `.env`)
- **npm** v9+

## Setup & Run

### 1. Clone and navigate

```bash
cd PBL_G2
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # then edit .env if needed
npm install
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### 4. Default NGO Admin Account

On first run the backend seeds an NGO admin:

- **Email:** admin@ngo.org
- **Password:** admin123

## Environment Variables (Backend)

| Variable | Default | Description |
|---|---|---|
| PORT | 5000 | Server port |
| MONGO_URI | mongodb://localhost:27017/womensafety | MongoDB connection |
| JWT_SECRET | supersecretkey123 | JWT signing secret |
| ENCRYPTION_KEY | 32-char hex key | AES-256 encryption key for reports |

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |
| POST | /api/reports | Submit anonymous report | Yes |
| GET | /api/reports | Get all reports | Yes (NGO) |
| PATCH | /api/reports/:id/status | Update report status | Yes (NGO) |
| POST | /api/sos | Send SOS alert | Yes |
| GET | /api/sos | Get all SOS alerts | Yes (NGO) |
| PATCH | /api/sos/:id/resolve | Resolve SOS alert | Yes (NGO) |
| GET | /api/flagged | Get flagged locations | Yes |

## Project Structure

```
PBL_G2/
├── backend/
│   ├── config/          # DB connection + seed
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── server.js        # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── i18n/        # Translation files
│   └── ...
└── README.md
```
