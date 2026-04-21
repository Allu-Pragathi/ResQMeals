# ResQMeals - Fighting Food Waste Together 🍲🌍

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

**ResQMeals** is a premium, full-stack platform dedicated to bridging the gap between food abundance and food scarcity. By connecting restaurants, event organizers, and grocery stores with NGOs and volunteers, we transform potential food waste into community nutrition.

---

## ✨ Key Features

### 🏢 For Donors (The Lifeblood)
*   **Smart Listing**: AI-assisted listing for excess food with category tagging and freshness expiration tracking.
*   **Impact Analytics**: A dedicated dashboard showing meals donated, CO2 prevented, and community reach.
*   **Real-time Tracking**: Watch your donation journey from "Listed" to "Delivered" with live GPS updates.
*   **Verification Badge**: Earn "Verified Donor" status through consistent and high-quality donations.

### 🤝 For NGOs & Volunteers (The Heroes)
*   **Live Food Finder**: An interactive map view powered by Leaflet to find available donations in your immediate vicinity.
*   **Verification Center**: Securely upload documents for NGO verification to unlock high-volume donation access.
*   **Community Leaderboard**: Compete for top spots by rescuing more meals and earning "Hero Points."
*   **AI Support**: Integrated chatbot to help navigate logistics and answer platform questions.

---

## 🛠️ Technology Stack

ResQMeals is built with a modern, high-performance stack designed for scalability and user delight:

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS + Tailwind CSS (Glassmorphism & Dark Mode)
- **Animations**: Framer Motion for premium micro-interactions
- **Maps**: Leaflet & React-Leaflet
- **Icons**: Lucide-React
- **Charts**: Recharts for impact visualization

### Backend
- **Server**: Node.js & Express (TypeScript)
- **ORM**: Prisma Client
- **Auth**: JWT & Bcrypt (Secure Role-Based Access Control)
- **AI**: Gemini API / Groq SDK for intelligent logistics support
- **Messaging**: Twilio / Nodemailer for instant notifications

---

## 📁 Project Structure

```bash
ResQMeals/
├── resqmeals-frontend/     # React Application (Client-side)
├── resqmeals-backend/      # Node.js API (Server-side)
└── ngo-pipeline/           # Python Data Scrapers & ML Models
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL / Supabase Account
*   Git

### Installation & Local Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Allu-Pragathi/ResQMeals.git
    cd ResQMeals
    ```

2.  **Backend Configuration**
    ```bash
    cd resqmeals-backend
    npm install
    cp .env.template .env # Configure DATABASE_URL, JWT_SECRET, etc.
    npx prisma generate
    npx prisma migrate dev
    npm run dev
    ```

3.  **Frontend Configuration**
    ```bash
    cd ../resqmeals-frontend
    npm install
    npm run dev
    ```

The app will be available at `http://localhost:5173` and the API at `http://localhost:8000`.

---

## 📊 Impact Metrics
We track every rescue to show the collective power of the community:
*   **50,000+** Meals Rescued
*   **45 Tons** of CO2 Prevented
*   **1,200+** Active Partners

---

## 🤝 Contributing
We love community contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for a Zero-Waste World</p>
