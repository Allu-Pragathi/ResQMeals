import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from typing import List, Dict

def scrape_google_maps(queries: List[str], city: str, max_results: int = 50) -> List[Dict]:
    """
    Scrape NGO data from Google Maps using Selenium.
    """
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Set to headless for production
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    all_results = []
    
    for query in queries:
        search_query = f"{query} {city}"
        print(f"Searching Google Maps for: {search_query}")
        
        driver.get(f"https://www.google.com/maps/search/{search_query}")
        time.sleep(5)
        
        # Scroll to load more results
        try:
            scrollable_div = driver.find_element(By.XPATH, '//div[contains(@aria-label, "Results for")]')
            for _ in range(5):
                driver.execute_script('arguments[0].scrollTop = arguments[0].scrollHeight', scrollable_div)
                time.sleep(2)
        except:
            pass
            
        # Extract place cards
        # Note: selectors might change as Google updates Maps UI
        places = driver.find_elements(By.CLASS_NAME, 'Nv2Ybe') # Common class for results
        if not places:
            places = driver.find_elements(By.XPATH, '//div[contains(@class, "hfpxzc")]') # alternative

        count = 0
        for place in places:
            if count >= max_results:
                break
                
            try:
                # Click to get details if needed, but let's try direct extraction first
                name = place.get_attribute('aria-label')
                # For more details, one might need to click each result
                # but many fields are in the aria-label or accessible via sub-elements
                
                # For simplicity in this demo, we'll just grab the name and attempt to find address
                # A more robust scraper would click each result.
                
                results = {
                    'name': name,
                    'address': '', # Needs more detailed scraping
                    'city': city,
                    'phone': '',
                    'email': '',
                    'website': '',
                    'latitude': None,
                    'longitude': None,
                    'source': 'Google Maps'
                }
                
                # Logic to extract address and phone from the card
                # This is highly dependent on Google Maps UI structure
                
                all_results.append(results)
                count += 1
            except Exception as e:
                print(f"Error extracting place: {e}")
                
    driver.quit()
    return all_results

def get_google_maps_ngos(city_queries: Dict[str, List[str]]) -> pd.DataFrame:
    all_ngos = []
    for city, queries in city_queries.items():
        all_ngos.extend(scrape_google_maps(queries, city))
    return pd.DataFrame(all_ngos)
