# 🍲 ResQMeals - Fighting Food Waste Together

![ResQMeals Banner](https://images.unsplash.com/photo-1593113565214-80afcb4a45d7?q=80&w=2000&auto=format&fit=crop) *(Consider replacing this an actual screenshot of your app)*

**ResQMeals** is a full-stack web application designed to connect food donors (like restaurants, event venues, and grocery stores) with nearby NGOs and volunteers to reduce food waste and help communities in need.

---

## 🚀 Features

### For Donors (Restaurants/Venues)
* **Quick List**: Easily post excess food available for donation with details like type, quantity, and expiration time.
* **Real-time Status**: Track when an NGO claims your food and when it is picked up.
* **Secure Dashboard**: Manage your active and past donations from a personalized control panel.

### For NGOs & Volunteers
* **Live Feed**: View a real-time feed or map of available donations in your area.
* **Instant Claiming**: Accept donations with a single click, preventing duplicate claims by other NGOs.
* **Route Logistics**: Get details on pickup locations and times.

---

## 🛠️ Technology Stack

ResQMeals is built using modern, enterprise-grade technologies:

### Frontend
* **Core**: React (v19) & TypeScript
* **Styling**: Tailwind CSS for rapid UI design and glassmorphism effects.
* **Animations**: Framer Motion for smooth micro-interactions.
* **Routing**: React Router DOM
* **Build Tool**: Vite

### Backend
* **Environment**: Node.js & Express
* **Language**: TypeScript
* **Database ORM**: Prisma Client
* **Authentication**: JWT (JSON Web Tokens) & Bcrypt for secure password hashing.
* **Database**: PostgreSQL (via Supabase - *adjust if using another host*)

---

## 💻 Running the Project Locally

Follow these steps to get ResQMeals running on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.x or higher)
* [PostgreSQL](https://www.postgresql.org/) (or a Supabase account)
* Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/Allu-Pragathi/ResQMeals.git
cd ResQMeals
```

### Step 2: Backend Setup
```bash
# Navigate to the backend folder
cd resqmeals-backend

# Install dependencies
npm install

# Set up your environment variables
# Create a .env file and add:
# DATABASE_URL="your-postgres-connection-string"
# JWT_SECRET="your-super-secret-key"

# Run Prisma Migrations
npx prisma migrate dev --name init

# Start the server (runs on Port 5000)
npm run dev
```

### Step 3: Frontend Setup
Open a new terminal window:
```bash
# Navigate to the frontend folder
cd resqmeals-frontend

# Install dependencies
npm install

# Ensure your frontend knows where the backend is
# Create a .env file locally if needed, but standard Axios setup points to localhost:5000

# Start the development server (runs with Vite)
npm run dev
```

### Step 4: View the App
Open your browser and navigate to `http://localhost:5173` (or whichever port Vite provides).

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/Allu-Pragathi/ResQMeals/issues).

## 📝 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
