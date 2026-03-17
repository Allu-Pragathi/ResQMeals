# ResQMeals - Fighting Food Waste Together

**ResQMeals** is a full-stack web application designed to connect food donors (like restaurants, event venues, and grocery stores) with nearby NGOs and volunteers to reduce food waste and help communities in need.

---

## Features

### For Donors (Restaurants/Venues)
* **Quick List**: Easily post excess food available for donation with details like type, quantity, and expiration time.
* **Real-time Status**: Track when an NGO claims your food and when it is picked up.
* **Secure Dashboard**: Manage your active and past donations from a personalized control panel.

### For NGOs & Volunteers
* **Live Feed**: View a real-time feed or map of available donations in your area.
* **Instant Claiming**: Accept donations with a single click, preventing duplicate claims by other NGOs.
* **Route Logistics**: Get details on pickup locations and times.

---

## Technology Stack

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

## Project Structure

This repository is divided into three main components:

1. **[resqmeals-frontend](./resqmeals-frontend)**: The React user interface.
2. **[resqmeals-backend](./resqmeals-backend)**: The Node.js/Express API server.
3. **[ngo-pipeline](./ngo-pipeline)**: Python scripts for data cleaning and scraping NGO data.

---

## Running the Project Locally

Follow these steps to get ResQMeals running on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [Python 3.10+](https://www.python.org/) (for the data pipeline)
* [PostgreSQL](https://www.postgresql.org/) (or a Supabase account)
* Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/Allu-Pragathi/ResQMeals.git
cd ResQMeals
```

### Step 2: Backend Setup
```bash
cd resqmeals-backend
npm install

# Set up environment variables
cp .env.template .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run Migrations
npx prisma migrate dev

# Start development server (Runs on Port 8000)
npm run dev
```

### Step 3: Frontend Setup
```bash
# In a new terminal
cd resqmeals-frontend
npm install

# Start development server (Runs on Port 5173)
npm run dev
```

---

## Data Pipeline (Optional)

If you need to scrape or clean NGO data:

1. **Navigate to the pipeline folder**:
   ```bash
   cd ngo-pipeline
   ```
2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Setup environment**:
   ```bash
   cp .env.template .env
   # Add your SUPABASE_URL and SUPABASE_KEY
   ```
4. **Run scripts**:
   ```bash
   python main.py
   ```

---

## Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/Allu-Pragathi/ResQMeals/issues).

## License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

