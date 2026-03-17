from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import pandas as pd
import time

def geocode_ngo_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing latitude and longitude using Nominatim API.
    """
    geolocator = Nominatim(user_agent="resqmeals_ngo_scraper")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
    
    # Filter only those with missing coordinates
    mask = df['latitude'].isna() | df['longitude'].isna()
    to_geocode = df[mask].copy()
    
    if to_geocode.empty:
        return df
        
    print(f"Geocoding {len(to_geocode)} records...")
    
    for idx, row in to_geocode.iterrows():
        # Clean address + city for better results
        search_query = f"{row['name']}, {row['address']}, {row['city']}"
        try:
            location = geocode(search_query)
            if location:
                df.at[idx, 'latitude'] = location.latitude
                df.at[idx, 'longitude'] = location.longitude
            else:
                # Try just address and city
                location = geocode(f"{row['address']}, {row['city']}")
                if location:
                    df.at[idx, 'latitude'] = location.latitude
                    df.at[idx, 'longitude'] = location.longitude
        except Exception as e:
            print(f"Error geocoding {row['name']}: {e}")
            time.sleep(1)
            
    return df
