import axios from 'axios';

/**
 * Geocodes an address string into latitude and longitude using Nominatim (OpenStreetMap).
 */
export async function geocodeAddress(addressSnippet: string): Promise<{ latitude: number | null; longitude: number | null }> {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: addressSnippet,
                format: 'json',
                limit: 1,
                'accept-language': 'en'
            },
            headers: {
                'User-Agent': 'ResQMeals_App'
            }
        });

        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
            };
        }
        return { latitude: null, longitude: null };
    } catch (error) {
        console.error('Geocoding error:', error);
        return { latitude: null, longitude: null };
    }
}
