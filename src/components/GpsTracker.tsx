
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Navigation2, MapPin, AlertTriangle } from 'lucide-react';

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

// Helper component to update map center when position changes
const SetViewOnPositionChange = ({ position }: { position: Position }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([position.lat, position.lng], 15);
  }, [map, position]);
  
  return null;
};

const GpsTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [routePath, setRoutePath] = useState<Position[]>([]);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Keep track of geolocation watch ID
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up function to stop tracking when component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!tracking) {
      // Stop watching position when tracking is turned off
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const startTracking = () => {
      if ("geolocation" in navigator) {
        toast.loading("Accessing your location...");
        setLocationError(null);
        
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            toast.success("Location accessed successfully!");
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
            let errorMessage = "Error accessing location";
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please enable location access in your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out.";
                break;
              default:
                errorMessage = `Location error: ${error.message}`;
            }
            
            toast.error(errorMessage);
            setLocationError(errorMessage);
            setTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        const errorMsg = "Geolocation is not supported by your browser";
        toast.error(errorMsg);
        setLocationError(errorMsg);
        setTracking(false);
      }
    };

    startTracking();
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

  const handleStartTracking = () => {
    if (!tracking) {
      if ("geolocation" in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            setTracking(true);
          } else if (result.state === 'prompt') {
            toast.info("Please allow location access when prompted");
            setTracking(true);
          } else if (result.state === 'denied') {
            toast.error("Location access is denied. Please enable location in your browser settings and try again.");
            setLocationError("Location permission denied. Please check your browser settings.");
          }
        }).catch(error => {
          // Handle permission query error (fallback to just trying to get location)
          toast.info("Requesting location access...");
          setTracking(true);
        });
      } else {
        toast.error("Geolocation is not supported by your browser");
        setLocationError("Geolocation is not supported by your browser");
      }
    } else {
      setTracking(false);
      toast.info("Tracking stopped");
    }
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
        {currentPosition ? (
          <div className="h-[300px] mb-4 rounded-lg overflow-hidden">
            <MapContainer
              style={{ height: '100%', width: '100%' }}
              center={[currentPosition.lat, currentPosition.lng]}
              zoom={15}
            >
              <SetViewOnPositionChange position={currentPosition} />
              
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <Marker 
                position={[currentPosition.lat, currentPosition.lng]}
                icon={customIcon}
              />
              
              {routePath.length > 1 && (
                <Polyline 
                  positions={routePath.map(pos => [pos.lat, pos.lng])}
                  pathOptions={{ color: 'red' }}
                />
              )}
            </MapContainer>
          </div>
        ) : locationError ? (
          <div className="h-[100px] mb-4 bg-red-50 rounded-lg flex items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="text-red-500 h-8 w-8" />
              <p className="text-red-700">{locationError}</p>
            </div>
          </div>
        ) : tracking ? (
          <div className="h-[100px] mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-8 w-8 border-4 border-fitness-primary border-t-transparent rounded-full"></div>
              <p className="text-fitness-primary">Acquiring your location...</p>
            </div>
          </div>
        ) : (
          <div className="h-[100px] mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Start tracking to see your route on the map</p>
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
            onClick={handleStartTracking} 
            className="w-full flex items-center justify-center gap-2"
            variant={tracking ? "destructive" : "default"}
          >
            <MapPin className="h-4 w-4" />
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GpsTracker;
