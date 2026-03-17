import requests

def test_query():
    query = """
    [out:json][timeout:25];
    area["name"="Bengaluru"]["admin_level"~"4|5|6|8"]->.searchArea;
    (
      node["amenity"="charity"](area.searchArea);
      way["amenity"="charity"](area.searchArea);
      relation["amenity"="charity"](area.searchArea);
      node["office"="ngo"](area.searchArea);
      way["office"="ngo"](area.searchArea);
      relation["office"="ngo"](area.searchArea);
      node["office"="foundation"](area.searchArea);
      node["social_facility"](area.searchArea);
      way["social_facility"](area.searchArea);
    );
    out count;
    """
    response = requests.get('http://overpass-api.de/api/interpreter', params={'data': query})
    print(response.json())

test_query()
