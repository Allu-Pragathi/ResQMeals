import pandas as pd
import os
from scraper.osm_scraper import get_all_osm_ngos
from scraper.google_maps_scraper import get_google_maps_ngos
from scraper.directory_scraper import scrape_indiango
from geocoder.geocode_addresses import geocode_ngo_dataframe
from utils.data_cleaning import clean_city, clean_phone, remove_duplicates, validate_coordinates
from database.insert_ngos import insert_ngos_to_db, export_to_csv

def main():
    cities = ["Hyderabad", "Bangalore", "Anantapur", "Chennai", "Mumbai", "Delhi"]
    
    # 1. Fetch data from OSM
    print("--- Starting OSM Scraper ---")
    osm_df = get_all_osm_ngos(cities)
    print(f"OSM found {len(osm_df)} records.")

    # 2. Fetch data from Google Maps (Skeleton/Basic)
    print("\n--- Starting Google Maps Scraper ---")
    city_queries = {
        "Hyderabad": ["NGO in Hyderabad", "food donation NGO in Hyderabad", "orphanage in Hyderabad"],
        "Bangalore": ["charitable trust in Bangalore", "orphanage in Bangalore", "NGO in Bangalore"],
        "Anantapur": ["charity organization in Anantapur", "NGO in Anantapur"]
    }
    # Note: requires Chrome and WebDriver
    # gmaps_df = get_google_maps_ngos(city_queries)
    gmaps_df = pd.DataFrame() # Placeholder for this demo
    print(f"Google Maps found {len(gmaps_df)} records.")

    # 3. Fetch from Directories
    print("\n--- Starting Directory Scrapers ---")
    dir_ngos = []
    for city in cities:
        dir_ngos.extend(scrape_indiango(city))
    dir_df = pd.DataFrame(dir_ngos)
    print(f"Directories found {len(dir_df)} records.")

    # 4. Merge all sources
    all_df = pd.concat([osm_df, gmaps_df, dir_df], ignore_index=True)
    if all_df.empty:
        print("No NGOs found. Check scraper logic.")
        return

    # 5. Data Cleaning
    print("\n--- Cleaning Data ---")
    all_df['city'] = all_df['city'].apply(clean_city)
    all_df['phone'] = all_df['phone'].apply(clean_phone)
    all_df = remove_duplicates(all_df)
    
    # 6. Geocoding
    print("\n--- Geocoding ---")
    all_df = geocode_ngo_dataframe(all_df)
    
    # 7. Final validation
    all_df['latitude'], all_df['longitude'] = zip(*all_df.apply(lambda x: validate_coordinates(x['latitude'], x['longitude']), axis=1))
    
    print(f"\nTotal unique NGOs collected: {len(all_df)}")
    
    # 8. Export and Storage
    export_to_csv(all_df)
    
    if len(all_df) >= 500:
        print("Success! Minimum requirement of 500 records met.")
    else:
        print(f"Warning: Only {len(all_df)} records collected. Consider adding more data sources.")

    # 9. Insert into Supabase
    try:
        insert_ngos_to_db(all_df)
    except Exception as e:
        print(f"Supabase insertion failed: {e}. Check your credentials in .env")

if __name__ == "__main__":
    main()
