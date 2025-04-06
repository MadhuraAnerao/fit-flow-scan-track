
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
  const [shakeThreshold, setShakeThreshold] = useState(15); // Default threshold
  const [lastShakeAction, setLastShakeAction] = useState<Date | null>(null);
  const navigate = useNavigate();
  
  // Shake detection logic
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
        
        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
        
        if (speed > shakeThreshold) {
          // Prevent shake detection from triggering too often
          if (currentTime - lastShake > 1000) {
            shakeCount++;
            lastShake = currentTime;
            
            if (shakeCount >= 2) {
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
    
    window.addEventListener('devicemotion', handleMotion);
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
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
