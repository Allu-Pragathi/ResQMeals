# NGO Records Scraping Pipeline for ResQMeals

A scalable Python pipeline to collect NGO data across Hyderabad, Bangalore, and Anantapur for the ResQMeals food redistribution platform.

## Features
- **Multi-Source Scraping**: Collects data from OSM, Google Maps, and NGO directories.
- **Data Cleaning**: Normalizes phone numbers, city names, and removes duplicates.
- **Geocoding**: Uses Nominatim API to convert addresses to coordinates.
- **Supabase Integration**: Inserts data directly into your Supabase PostgreSQL database.
- **CSV Export**: Generates a local `ngos_dataset_500.csv`.

## Setup
1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   - Rename `.env.template` to `.env`.
   - Add your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.

3. **Database Schema**:
   Ensure you have a table named `ngos` in your Supabase database with the following schema:
   ```sql
   create table ngos (
     id uuid primary key default uuid_generate_v4(),
     name text,
     address text,
     city text,
     phone text,
     email text,
     website text,
     latitude float8,
     longitude float8,
     source text,
     created_at timestamp with time zone default now()
   );
   ```

## Usage
Run the main script:
```bash
python main.py
```

## Structure
- `scraper/`: Modules for different data sources.
- `geocoder/`: Address to coordinate conversion.
- `database/`: Supabase client and insertion logic.
- `utils/`: Data cleaning and normalization.
- `main.py`: Main orchestration script.
