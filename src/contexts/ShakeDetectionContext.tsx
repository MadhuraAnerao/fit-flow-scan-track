
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Device } from '@capacitor/device';
import { Haptics } from '@capacitor/haptics';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type ShakeDetectionContextType = {
  isShakeEnabled: boolean;
  toggleShakeDetection: () => void;
  shakeThreshold: number;
  setShakeThreshold: (value: number) => void;
  lastShakeAction: Date | null;
};

const ShakeDetectionContext = createContext<ShakeDetectionContextType | undefined>(undefined);

export const ShakeDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShakeEnabled, setIsShakeEnabled] = useState(true);
  const [shakeThreshold, setShakeThreshold] = useState(8); // Lower threshold for better detection
  const [lastShakeAction, setLastShakeAction] = useState<Date | null>(null);
  const navigate = useNavigate();
  
  // Shake detection logic with improved sensitivity
  useEffect(() => {
    if (!isShakeEnabled) return;
    
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastUpdate = 0;
    let shakeCount = 0;
    let lastShake = 0;
    
    const handleMotion = (event: DeviceMotionEvent) => {
      const currentTime = new Date().getTime();
      
      if ((currentTime - lastUpdate) > 100) {
        const diffTime = currentTime - lastUpdate;
        lastUpdate = currentTime;
        
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;
        
        const x = acceleration.x || 0;
        const y = acceleration.y || 0;
        const z = acceleration.z || 0;
        
        // Calculate speed with more sensitivity to Z-axis (up/down) movement
        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
        
        if (speed > shakeThreshold) {
          console.log('Shake detected! Speed:', speed, 'Threshold:', shakeThreshold);
          
          // Prevent shake detection from triggering too often
          if (currentTime - lastShake > 800) { // Reduced cooldown time
            shakeCount++;
            lastShake = currentTime;
            
            // Only need one strong shake to trigger
            if (shakeCount >= 1) {
              console.log('Shake action triggered!');
              handleShakeAction();
              shakeCount = 0;
            }
          }
        }
        
        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };
    
    // Check if device motion events are available
    if (typeof DeviceMotionEvent !== 'undefined') {
      console.log('DeviceMotion is available, adding event listener');
      window.addEventListener('devicemotion', handleMotion, true);
      
      // Try to request permission on iOS 13+
      try {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          DeviceMotionEvent.requestPermission()
            .then(response => {
              if (response === 'granted') {
                console.log('Motion permission granted');
                window.addEventListener('devicemotion', handleMotion, true);
              } else {
                console.log('Motion permission denied');
                toast.error('Motion detection permission denied');
              }
            })
            .catch(console.error);
        }
      } catch (error) {
        console.error('Error requesting motion permission:', error);
      }
    } else {
      console.log('DeviceMotion is not available on this device');
      toast.warning('Shake detection not available on this device');
    }
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [isShakeEnabled, shakeThreshold]);
  
  const handleShakeAction = async () => {
    try {
      // Vibrate device
      await Haptics.vibrate();
      
      // Show motivational notification
      const motivationalMessages = [
        "Keep going! You're doing great on your fitness journey!",
        "Don't forget to track your calories today!",
        "A little progress each day adds up to big results!",
        "Stay hydrated and keep moving!",
        "Remember your fitness goals for today!"
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      toast.info(randomMessage, {
        description: "Shake detected! Stay motivated!",
        duration: 5000
      });
      
      // Update last shake action time
      setLastShakeAction(new Date());
      
      // Navigate to a random page
      const randomPages = ['/home', '/recipes', '/calories', '/profile', '/qr-scanner'];
      const randomIndex = Math.floor(Math.random() * randomPages.length);
      navigate(randomPages[randomIndex]);
      
    } catch (error) {
      console.error("Error handling shake action:", error);
    }
  };
  
  const toggleShakeDetection = () => {
    setIsShakeEnabled(prev => !prev);
    if (!isShakeEnabled) {
      toast.success("Shake detection enabled!");
    } else {
      toast.info("Shake detection disabled");
    }
  };
  
  const value = {
    isShakeEnabled,
    toggleShakeDetection,
    shakeThreshold,
    setShakeThreshold,
    lastShakeAction
  };
  
  return (
    <ShakeDetectionContext.Provider value={value}>
      {children}
    </ShakeDetectionContext.Provider>
  );
};

export const useShakeDetection = (): ShakeDetectionContextType => {
  const context = useContext(ShakeDetectionContext);
  if (context === undefined) {
    throw new Error('useShakeDetection must be used within a ShakeDetectionProvider');
  }
  return context;
};
