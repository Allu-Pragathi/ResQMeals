import requests
import pandas as pd
from typing import List, Dict

def fetch_osm_data(city: str) -> List[Dict]:
    """
    Fetch NGO/Charity data from OpenStreetMap using Overpass API.
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    # Expanded bounding boxes for cities [south, west, north, east] to reach 500+ goal
    city_bboxes = {
        "Hyderabad": "16.88,77.98,17.88,78.98", 
        "Bangalore": "12.47,77.09,13.47,78.09", 
        "Anantapur": "14.18,77.10,15.18,78.10"  
    }
    
    if city not in city_bboxes:
        return []

    bbox = city_bboxes[city]

    # Include more tags to capture more NGOs
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="charity"]({bbox});
      way["amenity"="charity"]({bbox});
      relation["amenity"="charity"]({bbox});
      
      node["office"="ngo"]({bbox});
      way["office"="ngo"]({bbox});
      relation["office"="ngo"]({bbox});
      
      node["office"="foundation"]({bbox});
      way["office"="foundation"]({bbox});
      
      node["social_facility"]({bbox});
      way["social_facility"]({bbox});
      
      node["social_facility"="food_bank"]({bbox});
      
      node["amenity"="community_centre"]({bbox});
      way["amenity"="community_centre"]({bbox});
    );
    out center;
    """
    
    # Be polite to the OSM API to prevent 429
    import time
    time.sleep(3)
    headers = {'User-Agent': 'ResQMeals-NGO-Scraper/1.0'}
    
    response = requests.get(overpass_url, params={'data': query}, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching OSM data for {city}: {response.status_code}")
        return []
        
    data = response.json()
    elements = data.get('elements', [])
    
    results = []
    for el in elements:
        tags = el.get('tags', {})
        name = tags.get('name')
        if not name:
            continue
            
        # Get coordinates
        lat = el.get('lat') or el.get('center', {}).get('lat')
        lon = el.get('lon') or el.get('center', {}).get('lon')
        
        results.append({
            'name': name,
            'address': tags.get('addr:full') or f"{tags.get('addr:street', '')} {tags.get('addr:city', city)}",
            'city': city,
            'phone': tags.get('phone') or tags.get('contact:phone'),
            'email': tags.get('email') or tags.get('contact:email'),
            'website': tags.get('website') or tags.get('contact:website'),
            'latitude': lat,
            'longitude': lon,
            'source': 'OpenStreetMap'
        })
        
    return results

def get_all_osm_ngos(cities: List[str]) -> pd.DataFrame:
    all_ngos = []
    for city in cities:
        print(f"Fetching OSM data for {city}...")
        all_ngos.extend(fetch_osm_data(city))
        
    return pd.DataFrame(all_ngos)
