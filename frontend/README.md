# Budget Tracker Anwendung

🚧 Hinweis: Diese Anwendung befindet sich derzeit in aktiver Entwicklung.
Das Benutzerinterface ist einfach gehalten und wird schrittweise verbessert.
Ziel ist es, eine stabile Full-Stack-Grundstruktur bereitzustellen.

## Projektübersicht

Budget Tracker ist eine moderne Webanwendung zur persönlichen Finanzverwaltung. Die Anwendung ermöglicht es Benutzern, ihre Einnahmen und Ausgaben zu verfolgen, Belege hochzuladen und detaillierte finanzielle Übersichten zu erstellen.

## Funktionen

- 🔐 Benutzerauthentifizierung (Registrierung/Login)
- 💰 Einnahmen- und Ausgabenverfolgung
- 📊 Finanzbericht und Zusammenfassungen
- 📸 Belegupload-Funktion
- 🔍 Such- und Filterfunktionen
- 📱 Responsive Design

- **Frontend:**

  - React
  - TypeScript
  - Tailwind CSS
  - Axios

- **Backend:**

  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## Installation

### Voraussetzungen

- Node.js (v14 oder höher)
- MongoDB
- npm

### Setup

1. Repository klonen:

git clone git@github.com:Alpi2/Budget-Tracker.git

2. Abhängigkeiten installieren:

## Backend Abhängigkeiten

cd backend
npm install

## Frontend Abhängigkeiten

cd frontend
npm install

3.Umgebungsvariablen konfigurieren:

## Backend (.env)

MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
TOKEN_EXPIRATION=1h
PORT=5000

## Frontend (.env)

REACT_APP_API_URL=`http://localhost:5000`

4.Anwendung starten:

## Backend starten

cd backend
npm start

## Frontend starten

cd frontend
npm start

---

## API-Endpunkte

### Authentifizierung

- POST `/api/auth/register` - Neuen Benutzer registrieren
- POST `/api/auth/login` - Benutzer einloggen
- GET `/api/auth/validate` - Token validieren

### Transaktionen

- GET `/api/transactions` - Alle Transaktionen abrufen
- POST `/api/transactions` - Neue Transaktion erstellen
- PUT `/api/transactions/:id` - Transaktion aktualisieren
- DELETE `/api/transactions/:id` - Transaktion löschen
- GET `/api/transactions/summary` - Finanzzusammenfassung abrufen

## Sicherheit

- Passwort-Hashing mit bcrypt
- JWT-basierte Authentifizierung
- Geschützte API-Endpunkte
- Sichere Dateiuploads
