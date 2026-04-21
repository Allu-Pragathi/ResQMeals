import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService, type Coordinates } from '../../services/locationService';
import { ngoService, type NgoData } from '../../services/ngoService';
import { calculateDistance } from '../../utils/distance';
import { MapPin, AlertCircle, Loader2, Navigation, Send } from 'lucide-react';

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const NGOFinder = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [ngos, setNgos] = useState<(NgoData & { distance: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCityFallback, setSelectedCityFallback] = useState('Hyderabad');
  const [addressInput, setAddressInput] = useState('');

  // Manual cities fallback if GPS fails
  const fallbackCities = {
    Hyderabad: { latitude: 17.3850, longitude: 78.4867 },
    Bangalore: { latitude: 12.9716, longitude: 77.5946 },
    Anantapur: { latitude: 14.6819, longitude: 77.6006 },
  };

  const fetchNgos = async (lat: number, lon: number, city?: string) => {
    try {
      setLoading(true);
      const data = await ngoService.getNearbyNgos(lat, lon, city);
      const withDistance = data.map(ngo => ({
        ...ngo,
        distance: calculateDistance(lat, lon, ngo.latitude, ngo.longitude)
      })).sort((a, b) => a.distance - b.distance);
      setNgos(withDistance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        setCoords({ latitude: lat, longitude: lon });
        fetchNgos(lat, lon, 'Custom Search');
      } else {
        setError('Location not found. Try a different address or city name.');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to fetch coordinates for this address.');
      setLoading(false);
    }
  };

  const initLocation = async () => {
    try {
      setLoading(true);
      setError('');
      const p = await locationService.getCurrentLocation();
      setCoords(p);
      fetchNgos(p.latitude, p.longitude);
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setError('Location access denied. Please enter manually.');
      } else {
        setError(err.message || 'Could not fetch location.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    initLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSearch = (city: keyof typeof fallbackCities) => {
    setSelectedCityFallback(city);
    const fallback = fallbackCities[city];
    setCoords(fallback);
    fetchNgos(fallback.latitude, fallback.longitude, city);
    setError('');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      
      {/* LEFT PANEL: NGO LIST */}
      <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-6 flex flex-col h-[500px]">
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <span className="p-2 bg-orange-100 rounded-lg text-orange-600"><AlertCircle className="w-5 h-5" /></span>
            Active SOS
          </h2>
          <p className="text-sm text-slate-500 mt-2">Nearby NGOs currently accepting food (5km radius).</p>
        </div>

        {/* Address Search */}
        <form onSubmit={handleManualAddressSearch} className="mb-4 flex-shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={addressInput} 
              onChange={e => setAddressInput(e.target.value)}
              placeholder="Search custom address..." 
              className="w-full text-sm pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" 
            />
            <button type="submit" disabled={loading} className="absolute right-1 text-primary p-2 hover:bg-orange-50 disabled:opacity-50 rounded-lg transition-colors">
               <Navigation className="w-4 h-4" />
            </button>
          </div>
        </form>

        {error && (
            <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 text-sm p-4 rounded-xl">
              <p className="font-semibold mb-2">{error}</p>
              <p className="mb-2">Select a city manually:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(fallbackCities).map(city => (
                  <button 
                    key={city}
                    onClick={() => handleManualSearch(city as any)}
                    className="px-3 py-1 bg-white border border-orange-200 rounded-full text-xs hover:bg-orange-100 transition"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400">
               <Loader2 className="w-8 h-8 animate-spin mb-4" />
               <p className="text-sm">Scanning territory...</p>
            </div>
          ) : ngos.length === 0 ? (
            <div className="text-center p-8 text-slate-400 bg-white border border-slate-200 border-dashed rounded-2xl">
              <MapPin className="w-8 h-8 mx-auto mb-3" />
              <p className="text-sm font-medium">No NGOs within 5 km.</p>
              <p className="text-xs mt-1">Try expanding search manually or dropping food off at verified points.</p>
            </div>
          ) : (
            ngos.map(ngo => (
              <div key={ngo.id} className="bg-white border text-left border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{ngo.name}</h3>
                  <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider">
                    Needs Food Now
                  </span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {ngo.distance.toFixed(1)} km away
                  </span>
                  <button className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg group-hover:bg-orange-600 transition flex items-center gap-1">
                    Donate <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: MAP VIEW */}
      <div className="w-full md:w-2/3 h-[400px] md:h-auto relative bg-slate-100">
        {!coords ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : <MapPin className="w-10 h-10" />}
          </div>
        ) : (
          <MapContainer 
            center={[coords.latitude, coords.longitude]} 
            zoom={13} 
            scrollWheelZoom={false} 
            className="w-full h-full"
            key={`${coords.latitude}-${coords.longitude}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* 5 km Radius Circle */}
            <Circle 
                center={[coords.latitude, coords.longitude]} 
                radius={5000} 
                pathOptions={{ color: '#fb923c', fillColor: '#fed7aa', fillOpacity: 0.2 }}
            />
            <Marker position={[coords.latitude, coords.longitude]} icon={donorIcon}>
              <Popup>You are here</Popup>
            </Marker>
            
            {ngos.map(ngo => (
               <Marker key={ngo.id} position={[ngo.latitude, ngo.longitude]} icon={ngoIcon}>
                 <Popup className="rounded-lg shadow-sm">
                   <div className="p-1">
                      <p className="font-bold text-emerald-700 m-0">{ngo.name}</p>
                      <p className="text-xs text-slate-500 m-0 mb-2">{ngo.distance.toFixed(2)} km away</p>
                      <button className="w-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition px-2 py-1 rounded">Select NGO</button>
                   </div>
                 </Popup>
               </Marker>
            ))}
          </MapContainer>
        )}
      </div>

    </div>
  );
};
