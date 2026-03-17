# ResQMeals Backend

The backend server for the ResQMeals platform, built with Node.js, Express, and Prisma.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   - Copy `.env.template` to `.env`:
     ```bash
     cp .env.template .env
     ```
   - Update the values in `.env` with your database connection string and desired secrets.

3. **Database Migration**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Run the Server**:
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

The server runs on `http://localhost:8000` by default.

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/donations` - List available donations
- `POST /api/donations` - Create a new donation
- `PATCH /api/donations/:id/accept` - Accept a donation (NGOs)

*(Refer to source code for detailed endpoint documentation)*
