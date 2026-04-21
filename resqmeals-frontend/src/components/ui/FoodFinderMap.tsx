import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Utensils } from 'lucide-react';

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const foodIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface FoodFinderMapProps {
  ngoLat?: number;
  ngoLon?: number;
  radiusKm?: number;
  availableDonations: any[]; // Expecting donations with .latitude, .longitude, distance etc
}

export const FoodFinderMap = ({ ngoLat, ngoLon, radiusKm = 5, availableDonations }: FoodFinderMapProps) => {
  // Filter donations strictly that have coordinates
  const mappedDonations = availableDonations.filter(d => d.latitude && d.longitude);

  if (!ngoLat || !ngoLon) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl text-slate-400 p-6 text-center">
        <MapPin className="h-8 w-8 mb-2 opacity-50" />
        <p className="font-semibold text-sm">Location Required</p>
        <p className="text-xs mt-1">Please ensure your NGO profile has a valid base location added.</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-square md:aspect-video relative rounded-xl overflow-hidden z-0 border border-slate-200 shadow-sm">
      <MapContainer 
        center={[ngoLat, ngoLon]} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* NGO Base Location */}
        <Marker position={[ngoLat, ngoLon]} icon={ngoIcon}>
          <Popup>
            <div className="font-bold text-orange-700">NGO Base</div>
            <div className="text-xs">Your monitoring center</div>
          </Popup>
        </Marker>

        {/* 5 km Radius Circle */}
        <Circle 
            center={[ngoLat, ngoLon]} 
            radius={radiusKm * 1000} 
            pathOptions={{ color: '#fb923c', fillColor: '#fed7aa', fillOpacity: 0.15, weight: 2 }}
        />
        
        {/* Donation Markers */}
        {mappedDonations.map(donation => (
          <Marker 
            key={donation.id} 
            position={[donation.latitude, donation.longitude]} 
            icon={foodIcon}
          >
            <Popup className="rounded-xl shadow-lg border-none" minWidth={200}>
              <div className="p-1">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-green-100 p-1.5 rounded-lg text-green-700">
                      <Utensils className="h-4 w-4" />
                   </div>
                   <p className="font-extrabold text-slate-900 m-0">{donation.foodType}</p>
                </div>
                <div className="space-y-1 mb-3">
                   <p className="text-xs font-bold text-slate-600 m-0 flex items-center justify-between">
                     <span>Qty:</span> <span className="text-slate-900">{donation.quantity}</span>
                   </p>
                   <p className="text-xs font-bold text-slate-600 m-0 flex items-center justify-between">
                     <span>Dist:</span> <span className="text-orange-600">{donation.distance?.toFixed(1)} km</span>
                   </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
