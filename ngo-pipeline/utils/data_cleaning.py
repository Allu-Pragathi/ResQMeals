import pandas as pd
import re

def clean_phone(phone):
    if not phone or pd.isna(phone):
        return None
    # Remove non-numeric characters except +
    cleaned = re.sub(r'[^\d+]', '', str(phone))
    return cleaned if cleaned else None

def clean_city(city):
    if not city or pd.isna(city):
        return None
    city = str(city).strip().title()
    # Normalize known cities
    if "Bangalore" in city or "Bengaluru" in city:
        return "Bangalore"
    if "Hyderabad" in city:
        return "Hyderabad"
    if "Anantapur" in city:
        return "Anantapur"
    return city

def remove_duplicates(df):
    """
    Remove duplicates based on normalized name, address, and city.
    """
    df['name_clean'] = df['name'].str.lower().str.replace(r'[^\w\s]', '', regex=True).str.strip()
    df['address_clean'] = df['address'].str.lower().str.replace(r'[^\w\s]', '', regex=True).str.strip()
    
    # Drop duplicates
    df = df.drop_duplicates(subset=['name_clean', 'address_clean', 'city'])
    
    # Remove cleaning helper columns
    df = df.drop(columns=['name_clean', 'address_clean'])
    return df

def validate_coordinates(lat, lon):
    try:
        lat = float(lat)
        lon = float(lon)
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return lat, lon
    except:
        pass
    return None, None
