
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngTuple } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Navigation2 } from 'lucide-react';

// Fix the marker icon issue
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface Position {
  lat: number;
  lng: number;
}

const GpsTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [routePath, setRoutePath] = useState<Position[]>([]);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    let watchId: number;

    const startTracking = () => {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            setCurrentPosition(newPosition);
            setRoutePath(prev => {
              if (prev.length > 0) {
                // Calculate distance
                const lastPos = prev[prev.length - 1];
                const newDistance = calculateDistance(lastPos, newPosition);
                setDistance(d => d + newDistance);
                // Estimate calories (rough estimation: 0.75 calories per meter at walking speed)
                setCalories(c => c + (newDistance * 0.75));
              }
              return [...prev, newPosition];
            });
          },
          (error) => {
            toast.error("Error accessing location: " + error.message);
            setTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser");
      }
    };

    if (tracking) {
      startTracking();
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [tracking]);

  const calculateDistance = (pos1: Position, pos2: Position) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.lat * Math.PI) / 180;
    const φ2 = (pos2.lat * Math.PI) / 180;
    const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation2 className="text-fitness-primary" />
          Activity Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentPosition && (
          <div className="h-[300px] mb-4 rounded-lg overflow-hidden">
            <MapContainer
              center={[currentPosition.lat, currentPosition.lng] as LatLngTuple}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker 
                position={[currentPosition.lat, currentPosition.lng] as LatLngTuple}
                icon={customIcon}
              />
              {routePath.length > 1 && (
                <Polyline 
                  positions={routePath.map(pos => [pos.lat, pos.lng] as LatLngTuple)}
                  pathOptions={{ color: 'red' }}
                />
              )}
            </MapContainer>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-lg font-semibold">{(distance / 1000).toFixed(2)} km</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Calories Burned</p>
              <p className="text-lg font-semibold">{Math.round(calories)} kcal</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setTracking(!tracking)} 
            className="w-full"
            variant={tracking ? "destructive" : "default"}
          >
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GpsTracker;
