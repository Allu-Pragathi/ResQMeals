import { calculateDistance } from '../utils/distance';

export interface NgoData {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  needs_food: boolean;
  last_updated: string; // ISO string
}

const cities = {
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Hyderabad: { lat: 17.3850, lon: 78.4867 },
  Anantapur: { lat: 14.6819, lon: 77.6006 }
};

// Generate realistic dummy NGOs around the center coordinates
const generateNgos = (centerLat: number, centerLon: number, city: string): NgoData[] => {
  const ngos: NgoData[] = [];
  const names = ['Akshaya Patra', 'Feeding India', 'Robin Hood Army', 'No Food Waste', 'Roti Bank', 'Smile Foundation', 'Goonj', 'Local Orphanage', 'Community Kitchen', 'Food Rescue Team'];
  
  for (let i = 0; i < 15; i++) {
    // Generate within 0.08 degrees (~8-10km max range)
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lonOffset = (Math.random() - 0.5) * 0.1;

    ngos.push({
      id: `${city.toLowerCase()}-ngo-${i}`,
      name: `${names[i % names.length]} ${city} #${i}`,
      city: city,
      latitude: centerLat + latOffset,
      longitude: centerLon + lonOffset,
      needs_food: Math.random() > 0.3, // 70% need food
      last_updated: new Date(Date.now() - Math.random() * 3600 * 1000 * 2).toISOString() // updated within last 2 hours
    });
  }
  return ngos;
};

// Create a combined dataset safely
const allDummyNgos = [
  ...generateNgos(cities.Bangalore.lat, cities.Bangalore.lon, 'Bangalore'),
  ...generateNgos(cities.Hyderabad.lat, cities.Hyderabad.lon, 'Hyderabad'),
  ...generateNgos(cities.Anantapur.lat, cities.Anantapur.lon, 'Anantapur'),
];

export const ngoService = {
  getNearbyNgos: async (latitude: number, longitude: number, cityFallback?: string): Promise<NgoData[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let searchDataset = allDummyNgos;

    // If we have an exact coordinate (fallback coordinates provided by manual selection or GPS)
    // we just use the entire dataset and filter by radius.
    // If we need to dynamically generate for a completely unknown place, we can generate them on the fly
    const isNearbyToCities = allDummyNgos.some(n => calculateDistance(latitude, longitude, n.latitude, n.longitude) < 20);
    
    if (!isNearbyToCities) {
        // Automatically generate 15 NGOs in the user's specific unmapped region!
        searchDataset = generateNgos(latitude, longitude, cityFallback || 'Local Area');
    }

    // Filter NGOs: needs_food = true, within 5 km, updated recently
    const filtered = searchDataset.filter(ngo => {
      if (!ngo.needs_food) return false;
      const hoursSinceUpdate = (Date.now() - new Date(ngo.last_updated).getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > 2) return false;

      const distance = calculateDistance(latitude, longitude, ngo.latitude, ngo.longitude);
      return distance <= 5; // 5 km radius
    });

    return filtered;
  }
};
