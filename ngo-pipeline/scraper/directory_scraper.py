import requests
from bs4 import BeautifulSoup
import pandas as pd
from typing import List, Dict

def scrape_indiango(city: str) -> List[Dict]:
    """
    Scrape NGOs from indiango.org for a specific city.
    """
    # IndiaNGO usually has city pages like indiango.org/cityname-ngos.php
    city_slug = city.lower().replace(" ", "-")
    base_url = f"https://www.indiango.org/{city_slug}-ngos.php"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(base_url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Failed to scrape IndiaNGO for {city}: {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.content, 'html.parser')
        ngos = []
        
        # Look for table rows or list items (common in NGO directories)
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    name = cols[0].text.strip()
                    if name and len(name) > 3 and "NGO" in name.upper() or "TRUST" in name.upper():
                        address = cols[1].text.strip()
                        ngos.append({
                            'name': name,
                            'address': address,
                            'city': city,
                            'phone': '',
                            'email': '',
                            'website': '',
                            'latitude': None,
                            'longitude': None,
                            'source': 'indiango.org'
                        })
        return ngos
    except Exception as e:
        print(f"Error scraping indiango for {city}: {e}")
        return []


# Additional directory scrapers can be added here
